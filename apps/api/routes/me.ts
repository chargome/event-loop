import { Hono } from "@hono/hono";
import { requireAuth, getAuth } from "../auth/clerk.ts";

export const meApi = new Hono();

meApi.use("*", requireAuth);

meApi.get("/", (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ userId: auth.userId });
});
