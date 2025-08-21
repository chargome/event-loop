import { Hono } from "hono";
import { requireAuth } from "../auth/clerk.ts";

export const dbApi = new Hono();

dbApi.use("*", requireAuth);

dbApi.get("/health", async (c) => {
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
