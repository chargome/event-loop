import { Hono } from "hono";
import { eq, and, count, asc } from "drizzle-orm";
import { requireAuth } from "../auth/clerk";
import { createDb } from "../db/client";
import { events, users, rsvps } from "../db/schema";
import type { Env, Variables } from "../main";

export const eventsApi = new Hono<{ Bindings: Env; Variables: Variables }>();

// Protect all /events routes for now
eventsApi.use("*", requireAuth);

// GET /events
eventsApi.get("/", async (c) => {
  const { db } = createDb(c);
  try {
    // Get user info from Clerk auth context
    const user = c.get("user");
    if (!user?.id) return c.json({ error: "Unauthorized" }, 401);

    // Find user in our database
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, user.primaryEmailAddress?.emailAddress || ""));

    const dbUserId = existingUsers.length > 0 ? existingUsers[0].id : null;

    // Get office filter from query params
    const office = c.req.query("office") as
      | "VIE"
      | "SFO"
      | "YYZ"
      | "AMS"
      | "SEA"
      | undefined;

    const rows = office
      ? await db
          .select()
          .from(events)
          .where(and(eq(events.office, office), eq(events.status, "active")))
      : await db.select().from(events).where(eq(events.status, "active"));

    // Enhance each event with registration status and attendees
    const eventsWithDetails = await Promise.all(
      rows.map(async (event) => {
        // Check if current user is registered
        let isRegistered = false;
        if (dbUserId) {
          const registration = await db
            .select()
            .from(rsvps)
            .where(
              and(eq(rsvps.userId, dbUserId), eq(rsvps.eventId, event.id))
            );

          isRegistered =
            registration.length > 0 && registration[0].status === "going";
        }

        // Get attendees (limit to first 5 for performance)
        const attendeesRes = await db
          .select({
            id: users.id,
            name: users.name,
            avatar_url: users.avatarUrl,
          })
          .from(rsvps)
          .innerJoin(users, eq(rsvps.userId, users.id))
          .where(and(eq(rsvps.eventId, event.id), eq(rsvps.status, "going")))
          .orderBy(asc(rsvps.createdAt))
          .limit(5);

        // Get total going count
        const [countRes] = await db
          .select({ count: count() })
          .from(rsvps)
          .where(and(eq(rsvps.eventId, event.id), eq(rsvps.status, "going")));

        const goingCount = countRes?.count ?? 0;

        return {
          ...event,
          isRegistered,
          attendees: attendeesRes,
          goingCount,
        };
      })
    );

    return c.json({ events: eventsWithDetails });
  } catch (error) {
    console.error("Error fetching events:", error);
    return c.json({ error: String(error) }, 500);
  }
});

// GET /events/:id
eventsApi.get("/:id", async (c) => {
  const { db } = createDb(c);
  try {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) return c.json({ error: "Invalid event ID" }, 400);

    // Get user info from Clerk auth context
    const user = c.get("user");
    if (!user?.id) return c.json({ error: "Unauthorized" }, 401);

    // Find user in our database
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, user.primaryEmailAddress?.emailAddress || ""));

    const dbUserId = existingUsers.length > 0 ? existingUsers[0].id : null;

    // Get the event
    const eventRows = await db.select().from(events).where(eq(events.id, id));
    if (eventRows.length === 0) {
      return c.json({ error: "Event not found" }, 404);
    }
    const event = eventRows[0];

    // Check if current user is registered
    let userRsvp = null;
    if (dbUserId) {
      const registration = await db
        .select()
        .from(rsvps)
        .where(and(eq(rsvps.userId, dbUserId), eq(rsvps.eventId, event.id)));

      if (registration.length > 0) {
        userRsvp = registration[0];
      }
    }

    // Get all attendees
    const attendeesRes = await db
      .select({
        id: users.id,
        name: users.name,
        avatar_url: users.avatarUrl,
        status: rsvps.status,
        created_at: rsvps.createdAt,
      })
      .from(rsvps)
      .innerJoin(users, eq(rsvps.userId, users.id))
      .where(eq(rsvps.eventId, event.id))
      .orderBy(asc(rsvps.createdAt));

    // Separate attendees by status
    const going = attendeesRes.filter((a) => a.status === "going");
    const waitlist = attendeesRes.filter((a) => a.status === "waitlist");

    return c.json({
      event: {
        ...event,
        userRsvp,
        attendees: {
          going,
          waitlist,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    return c.json({ error: String(error) }, 500);
  }
});

// POST /events
eventsApi.post("/", async (c) => {
  const { db } = createDb(c);
  try {
    // Get user info from Clerk auth context
    const user = c.get("user");
    if (!user?.id) return c.json({ error: "Unauthorized" }, 401);

    // Find or create user in our database
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, user.primaryEmailAddress?.emailAddress || ""));

    let dbUserId;
    if (existingUsers.length > 0) {
      dbUserId = existingUsers[0].id;
    } else {
      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          email: user.primaryEmailAddress?.emailAddress || "",
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
          avatarUrl: user.imageUrl || null,
        })
        .returning({ id: users.id });
      dbUserId = newUser.id;
    }

    const body = await c.req.json();
    const {
      title,
      description,
      location,
      office = "VIE",
      startsAt,
      capacity,
      signupMode = "internal",
      externalUrl,
      isPublic = true,
    } = body;

    if (!title || !startsAt) {
      return c.json({ error: "Title and start time are required" }, 400);
    }

    const [newEvent] = await db
      .insert(events)
      .values({
        title,
        description,
        location,
        office,
        startsAt: new Date(startsAt),
        capacity,
        signupMode,
        externalUrl,
        isPublic,
        createdBy: dbUserId,
      })
      .returning();

    return c.json({ event: newEvent }, 201);
  } catch (error) {
    console.error("Error creating event:", error);
    return c.json({ error: String(error) }, 500);
  }
});

// PUT /events/:id
eventsApi.put("/:id", async (c) => {
  const { db } = createDb(c);
  try {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) return c.json({ error: "Invalid event ID" }, 400);

    // Get user info from Clerk auth context
    const user = c.get("user");
    if (!user?.id) return c.json({ error: "Unauthorized" }, 401);

    // Find user in our database
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, user.primaryEmailAddress?.emailAddress || ""));

    if (existingUsers.length === 0) {
      return c.json({ error: "User not found" }, 404);
    }
    const dbUserId = existingUsers[0].id;

    // Check if event exists and user is the creator
    const eventRows = await db.select().from(events).where(eq(events.id, id));
    if (eventRows.length === 0) {
      return c.json({ error: "Event not found" }, 404);
    }
    const event = eventRows[0];

    if (event.createdBy !== dbUserId) {
      return c.json({ error: "Only event creators can edit events" }, 403);
    }

    const body = await c.req.json();
    const {
      title,
      description,
      location,
      office,
      startsAt,
      capacity,
      signupMode,
      externalUrl,
      isPublic,
      status,
    } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (office !== undefined) updateData.office = office;
    if (startsAt !== undefined) updateData.startsAt = new Date(startsAt);
    if (capacity !== undefined) updateData.capacity = capacity;
    if (signupMode !== undefined) updateData.signupMode = signupMode;
    if (externalUrl !== undefined) updateData.externalUrl = externalUrl;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (status !== undefined) updateData.status = status;

    const [updatedEvent] = await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, id))
      .returning();

    return c.json({ event: updatedEvent });
  } catch (error) {
    console.error("Error updating event:", error);
    return c.json({ error: String(error) }, 500);
  }
});

// POST /events/:id/rsvp
eventsApi.post("/:id/rsvp", async (c) => {
  const { db } = createDb(c);
  try {
    const eventId = Number(c.req.param("id"));
    if (isNaN(eventId)) return c.json({ error: "Invalid event ID" }, 400);

    // Get user info from Clerk auth context
    const user = c.get("user");
    if (!user?.id) return c.json({ error: "Unauthorized" }, 401);

    // Find or create user in our database
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, user.primaryEmailAddress?.emailAddress || ""));

    let dbUserId;
    if (existingUsers.length > 0) {
      dbUserId = existingUsers[0].id;
    } else {
      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          email: user.primaryEmailAddress?.emailAddress || "",
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
          avatarUrl: user.imageUrl || null,
        })
        .returning({ id: users.id });
      dbUserId = newUser.id;
    }

    // Check if event exists
    const eventRows = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId));
    if (eventRows.length === 0) {
      return c.json({ error: "Event not found" }, 404);
    }
    const event = eventRows[0];

    // Check current capacity
    let status = "going";
    if (event.capacity) {
      const [countRes] = await db
        .select({ count: count() })
        .from(rsvps)
        .where(and(eq(rsvps.eventId, eventId), eq(rsvps.status, "going")));

      const currentCount = countRes?.count ?? 0;
      if (currentCount >= event.capacity) {
        status = "waitlist";
      }
    }

    // Insert or update RSVP
    const existingRsvp = await db
      .select()
      .from(rsvps)
      .where(and(eq(rsvps.userId, dbUserId), eq(rsvps.eventId, eventId)));

    if (existingRsvp.length > 0) {
      await db
        .update(rsvps)
        .set({ status: status as any })
        .where(and(eq(rsvps.userId, dbUserId), eq(rsvps.eventId, eventId)));
    } else {
      await db.insert(rsvps).values({
        userId: dbUserId,
        eventId,
        status: status as any,
      });
    }

    return c.json({
      status,
      message: `Successfully ${
        status === "waitlist" ? "added to waitlist" : "registered"
      }`,
    });
  } catch (error) {
    console.error("Error creating RSVP:", error);
    return c.json({ error: String(error) }, 500);
  }
});

// DELETE /events/:id/rsvp
eventsApi.delete("/:id/rsvp", async (c) => {
  const { db } = createDb(c);
  try {
    const eventId = Number(c.req.param("id"));
    if (isNaN(eventId)) return c.json({ error: "Invalid event ID" }, 400);

    // Get user info from Clerk auth context
    const user = c.get("user");
    if (!user?.id) return c.json({ error: "Unauthorized" }, 401);

    // Find user in our database
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, user.primaryEmailAddress?.emailAddress || ""));

    if (existingUsers.length === 0) {
      return c.json({ error: "User not found" }, 404);
    }
    const dbUserId = existingUsers[0].id;

    // Delete RSVP
    await db
      .delete(rsvps)
      .where(and(eq(rsvps.userId, dbUserId), eq(rsvps.eventId, eventId)));

    return c.json({ message: "RSVP cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling RSVP:", error);
    return c.json({ error: String(error) }, 500);
  }
});

// DELETE /events/:id
eventsApi.delete("/:id", async (c) => {
  const { db } = createDb(c);
  try {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) return c.json({ error: "Invalid event ID" }, 400);

    // Get user info from Clerk auth context
    const user = c.get("user");
    if (!user?.id) return c.json({ error: "Unauthorized" }, 401);

    // Find user in our database
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, user.primaryEmailAddress?.emailAddress || ""));

    if (existingUsers.length === 0) {
      return c.json({ error: "User not found" }, 404);
    }
    const dbUserId = existingUsers[0].id;

    // Check if event exists and user is the creator
    const eventRows = await db.select().from(events).where(eq(events.id, id));
    if (eventRows.length === 0) {
      return c.json({ error: "Event not found" }, 404);
    }
    const event = eventRows[0];

    if (event.createdBy !== dbUserId) {
      return c.json({ error: "Only event creators can delete events" }, 403);
    }

    // Delete related RSVPs first
    await db.delete(rsvps).where(eq(rsvps.eventId, id));

    // Delete the event
    await db.delete(events).where(eq(events.id, id));

    return c.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return c.json({ error: String(error) }, 500);
  }
});
