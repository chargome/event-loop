import { Hono } from "@hono/hono";
import { eq } from "drizzle-orm";
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
    const rows = await db.select().from(events);
    await client.end();
    return c.json({ events: rows });
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

    await client.end();
    return c.json({ event, goingCount, attendees });
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
