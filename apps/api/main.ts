import { Hono } from "@hono/hono";
import { logger } from "@hono/logger";
import { cors } from "@hono/cors";
import { createDb } from "./db/client.ts";
import { events } from "./db/schema.ts";

const app = new Hono();

app.use("*", logger());
app.use("*", cors());

app.get("/health", (c) => c.json({ status: "ok" }));

app.get("/db/health", async (c) => {
  const databaseUrl = Deno.env.get("DATABASE_URL");
  if (!databaseUrl) {
    return c.json({ ok: false, error: "DATABASE_URL not set" }, 500);
  }

  const { Client } = await import("pg");
  const client = new Client({ connectionString: databaseUrl });
  try {
    await client.connect();
    const result = await client.query("select 1 as ok");
    await client.end();
    return c.json({ ok: true, result: result.rows[0] });
  } catch (error) {
    try {
      await client.end();
    } catch {}
    return c.json({ ok: false, error: String(error) }, 500);
  }
});

app.get("/events", async (c) => {
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

Deno.serve({ port: 8787 }, app.fetch);

app.post("/events", async (c) => {
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
