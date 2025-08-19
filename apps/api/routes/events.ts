import { Hono } from "@hono/hono";
import { requireAuth } from "../auth/clerk.ts";
import { createDb } from "../db/client.ts";
import { events } from "../db/schema.ts";

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

// POST /events
eventsApi.post("/", async (c) => {
  const { db, client } = await createDb();
  try {
    const body = await c.req.json();
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const startsAtRaw = body?.startsAt;
    const createdBy = Number(body?.createdBy);
    if (!title || !startsAtRaw || !Number.isFinite(createdBy)) {
      return c.json({ error: "title, startsAt, createdBy are required" }, 400);
    }
    const startsAt = new Date(startsAtRaw);
    if (Number.isNaN(startsAt.getTime())) {
      return c.json({ error: "startsAt must be a valid date" }, 400);
    }

    const toInsert: any = {
      title,
      description:
        typeof body?.description === "string" ? body.description : null,
      location: typeof body?.location === "string" ? body.location : null,
      startsAt,
      capacity: body?.capacity != null ? Number(body.capacity) : null,
      createdBy,
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
