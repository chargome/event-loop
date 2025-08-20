import { Hono } from "@hono/hono";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../auth/clerk.ts";
import { createDb } from "../db/client.ts";
import { events, users } from "../db/schema.ts";

export const eventsApi = new Hono();

// Protect all /events routes for now
eventsApi.use("*", requireAuth);

// GET /events
eventsApi.get("/", async (c) => {
  const { db, client } = await createDb();
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
          const registration = await client.query(
            "select status from rsvps where user_id = $1 and event_id = $2",
            [dbUserId, event.id]
          );
          isRegistered =
            registration.rows.length > 0 &&
            registration.rows[0].status === "going";
        }

        // Get attendees (limit to first 5 for performance)
        const attendeesRes = await client.query(
          `select u.id, u.name, u.avatar_url 
           from rsvps r 
           join users u on r.user_id = u.id 
           where r.event_id = $1 and r.status = 'going'
           order by r.created_at
           limit 5`,
          [event.id]
        );

        // Get total going count
        const countRes = await client.query(
          "select count(*)::int as count from rsvps where event_id = $1 and status = 'going'",
          [event.id]
        );
        const goingCount = Number((countRes.rows[0] as any)?.count ?? 0);

        return {
          ...event,
          isRegistered,
          attendees: attendeesRes.rows,
          goingCount,
        };
      })
    );

    await client.end();
    return c.json({ events: eventsWithDetails });
  } catch (error) {
    try {
      await client.end();
    } catch {}
    return c.json({ error: String(error) }, 500);
  }
});

// GET /events/:id
eventsApi.get("/:id", async (c) => {
  const { db, client } = await createDb();
  try {
    const id = Number(c.req.param("id"));
    if (!Number.isFinite(id)) return c.json({ error: "Invalid id" }, 400);

    // Get user info from Clerk auth context
    const user = c.get("user");
    if (!user?.id) return c.json({ error: "Unauthorized" }, 401);

    // Find user in our database
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, user.primaryEmailAddress?.emailAddress || ""));

    const dbUserId = existingUsers.length > 0 ? existingUsers[0].id : null;

    const rows = await db.select().from(events).where(eq(events.id, id));
    const event = rows[0] as any;
    if (!event) {
      await client.end();
      return c.json({ error: "Not found" }, 404);
    }

    // Get attendees
    const attendeesRes = await client.query(
      `select u.id, u.email, u.name, u.avatar_url, r.created_at 
       from rsvps r 
       join users u on r.user_id = u.id 
       where r.event_id = $1 and r.status = 'going'
       order by r.created_at`,
      [id]
    );
    const attendees = attendeesRes.rows;
    const goingCount = attendees.length;

    // Check if current user is the creator
    let isCreator = false;
    if (dbUserId && event.createdBy === dbUserId) {
      isCreator = true;
    }

    await client.end();
    return c.json({ event, goingCount, attendees, isCreator });
  } catch (error) {
    try {
      await client.end();
    } catch {}
    return c.json({ error: String(error) }, 500);
  }
});

// POST /events
eventsApi.post("/", async (c) => {
  const { db, client } = await createDb();
  try {
    const body = await c.req.json();
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const startsAtRaw = body?.startsAt;
    if (!title || !startsAtRaw) {
      return c.json({ error: "title and startsAt are required" }, 400);
    }
    const startsAt = new Date(startsAtRaw);
    if (Number.isNaN(startsAt.getTime())) {
      return c.json({ error: "startsAt must be a valid date" }, 400);
    }

    // Get user info from Clerk auth context
    const user = c.get("user");
    if (!user?.id) return c.json({ error: "Unauthorized" }, 401);

    // Ensure user exists in our database
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, user.primaryEmailAddress?.emailAddress || ""));

    let dbUserId: number;
    if (existingUsers.length === 0) {
      // Create user record
      const newUser = await db
        .insert(users)
        .values({
          email: user.primaryEmailAddress?.emailAddress || "",
          name: user.fullName || null,
          avatarUrl: user.imageUrl || null,
        })
        .returning();
      dbUserId = newUser[0].id;
    } else {
      dbUserId = existingUsers[0].id;
    }

    const toInsert: any = {
      title,
      description:
        typeof body?.description === "string" ? body.description : null,
      location: typeof body?.location === "string" ? body.location : null,
      office: ["VIE", "SFO", "YYZ", "AMS", "SEA"].includes(body?.office)
        ? body.office
        : "VIE",
      startsAt,
      capacity: body?.capacity != null ? Number(body.capacity) : null,
      createdBy: dbUserId,
      signupMode:
        body?.signupMode === "external" || body?.signupMode === "internal"
          ? body.signupMode
          : "internal",
      externalUrl:
        typeof body?.externalUrl === "string" ? body.externalUrl : null,
      isPublic: body?.isPublic != null ? Boolean(body.isPublic) : true,
    };

    const inserted = await db.insert(events).values(toInsert).returning();
    await client.end();
    return c.json({ event: inserted[0] }, 201);
  } catch (error) {
    try {
      await client.end();
    } catch {}
    return c.json({ error: String(error) }, 500);
  }
});

// RSVP endpoints
eventsApi.post("/:id/register", async (c) => {
  const { db, client } = await createDb();
  try {
    const id = Number(c.req.param("id"));
    if (!Number.isFinite(id)) return c.json({ error: "Invalid id" }, 400);

    // Get user info from Clerk auth context
    const user = c.get("user");
    if (!user?.id) return c.json({ error: "Unauthorized" }, 401);

    // Ensure user exists in our database
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, user.primaryEmailAddress?.emailAddress || ""));

    let dbUserId: number;
    if (existingUsers.length === 0) {
      // Create user record
      const newUser = await db
        .insert(users)
        .values({
          email: user.primaryEmailAddress?.emailAddress || "",
          name: user.fullName || null,
          avatarUrl: user.imageUrl || null,
        })
        .returning();
      dbUserId = newUser[0].id;
    } else {
      dbUserId = existingUsers[0].id;
    }

    // load event
    const eventRows = await db.select().from(events).where(eq(events.id, id));
    const event = eventRows[0];
    if (!event) return c.json({ error: "Not found" }, 404);
    if (event.signupMode === "external") {
      return c.json(
        { error: "External signup only", externalUrl: event.externalUrl },
        400
      );
    }

    const countRes = await client.query(
      "select count(*)::int as count from rsvps where event_id = $1 and status = 'going'",
      [id]
    );
    const going = Number((countRes.rows[0] as any)?.count ?? 0);
    if (
      event.capacity != null &&
      Number.isFinite(event.capacity) &&
      going >= Number(event.capacity)
    ) {
      return c.json({ error: "Event is full" }, 400);
    }

    // Insert RSVP with actual user ID
    await client.query(
      "insert into rsvps(user_id, event_id, status) values ($1, $2, 'going') on conflict (user_id, event_id) do update set status = 'going'",
      [dbUserId, id]
    );
    await client.end();
    return c.json({ ok: true });
  } catch (error) {
    try {
      await client.end();
    } catch {}
    return c.json({ error: String(error) }, 500);
  }
});

eventsApi.delete("/:id/register", async (c) => {
  const { db, client } = await createDb();
  try {
    const id = Number(c.req.param("id"));
    if (!Number.isFinite(id)) return c.json({ error: "Invalid id" }, 400);

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

    await client.query(
      "update rsvps set status = 'cancelled' where user_id = $1 and event_id = $2",
      [existingUsers[0].id, id]
    );
    await client.end();
    return c.json({ ok: true });
  } catch (error) {
    try {
      await client.end();
    } catch {}
    return c.json({ error: String(error) }, 500);
  }
});

// PUT /events/:id - Edit an event (creator only)
eventsApi.put("/:id", async (c) => {
  const { db, client } = await createDb();
  try {
    const id = Number(c.req.param("id"));
    if (!Number.isFinite(id)) return c.json({ error: "Invalid id" }, 400);

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
    const eventRows = await db
      .select()
      .from(events)
      .where(and(eq(events.id, id), eq(events.status, "active")));
    const event = eventRows[0];
    if (!event) return c.json({ error: "Event not found" }, 404);
    if (event.createdBy !== dbUserId) {
      return c.json(
        { error: "Only the event creator can edit this event" },
        403
      );
    }

    const body = await c.req.json();
    const title =
      typeof body?.title === "string" ? body.title.trim() : event.title;

    let startsAt = event.startsAt;
    if (body?.startsAt) {
      const newStartsAt = new Date(body.startsAt);
      if (!Number.isNaN(newStartsAt.getTime())) {
        startsAt = newStartsAt;
      }
    }

    const updateData: any = {
      title,
      description:
        typeof body?.description === "string"
          ? body.description
          : event.description,
      location:
        typeof body?.location === "string" ? body.location : event.location,
      office: ["VIE", "SFO", "YYZ", "AMS", "SEA"].includes(body?.office)
        ? body.office
        : event.office,
      startsAt,
      capacity: body?.capacity != null ? Number(body.capacity) : event.capacity,
      signupMode: ["external", "internal"].includes(body?.signupMode)
        ? body.signupMode
        : event.signupMode,
      externalUrl:
        typeof body?.externalUrl === "string"
          ? body.externalUrl
          : event.externalUrl,
    };

    const updated = await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, id))
      .returning();

    await client.end();
    return c.json({ event: updated[0] });
  } catch (error) {
    try {
      await client.end();
    } catch {}
    return c.json({ error: String(error) }, 500);
  }
});

// DELETE /events/:id - Cancel an event (creator only)
eventsApi.delete("/:id", async (c) => {
  const { db, client } = await createDb();
  try {
    const id = Number(c.req.param("id"));
    if (!Number.isFinite(id)) return c.json({ error: "Invalid id" }, 400);

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
    const eventRows = await db
      .select()
      .from(events)
      .where(and(eq(events.id, id), eq(events.status, "active")));
    const event = eventRows[0];
    if (!event) return c.json({ error: "Event not found" }, 404);
    if (event.createdBy !== dbUserId) {
      return c.json(
        { error: "Only the event creator can delete this event" },
        403
      );
    }

    // Soft delete: mark as cancelled
    await db
      .update(events)
      .set({ status: "cancelled" })
      .where(eq(events.id, id));

    await client.end();
    return c.json({ ok: true });
  } catch (error) {
    try {
      await client.end();
    } catch {}
    return c.json({ error: String(error) }, 500);
  }
});
