import { drizzle } from "drizzle-orm/d1";
import type { Context } from "hono";
import type { Env, Variables } from "../main";

export function createDb(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const db = drizzle(c.env.DB);
  return { db, client: c.env.DB } as const;
}
