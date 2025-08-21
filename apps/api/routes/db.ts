import { Hono } from "hono";
import { requireAuth } from "../auth/clerk";
import { createDb } from "../db/client";
import type { Env, Variables } from "../main";

export const dbApi = new Hono<{ Bindings: Env; Variables: Variables }>();

dbApi.use("*", requireAuth);

dbApi.get("/health", async (c) => {
  try {
    const { db, client } = createDb(c);

    // Simple health check query for D1
    const result = await client.prepare("SELECT 1 as ok").first();

    return c.json({ ok: true, result });
  } catch (error) {
    return c.json({ ok: false, error: String(error) }, 500);
  }
});
