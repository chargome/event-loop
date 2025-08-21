import { Hono } from "hono";
import { requireAuth, getAuth } from "../auth/clerk";
import type { Env, Variables } from "../main";

export const meApi = new Hono<{ Bindings: Env; Variables: Variables }>();

meApi.use("*", requireAuth);

meApi.get("/", (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ userId: auth.userId });
});
