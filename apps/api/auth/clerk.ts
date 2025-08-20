import { createClerkClient } from "@clerk/backend";
import type { Context, MiddlewareHandler } from "@hono/hono";

export type AuthClaims = {
  userId?: string;
  sessionId?: string;
  claims?: Record<string, unknown>;
};

export const getAuth = (c: Context): AuthClaims | null => {
  return (c.get("auth") as AuthClaims) ?? null;
};

export const requireAuth: MiddlewareHandler = async (c, next) => {
  const secretKey = Deno.env.get("CLERK_SECRET_KEY");
  const publishableKey = Deno.env.get("CLERK_PUBLISHABLE_KEY");
  if (!secretKey || !publishableKey) throw new Error("Missing Clerk keys");

  const clerk = createClerkClient({ secretKey, publishableKey });
  const state = await clerk.authenticateRequest(c.req.raw);
  const auth = state.toAuth();
  if (!auth || !auth.userId) return c.json({ error: "Unauthorized" }, 401);

  // Fetch full user details from Clerk
  const user = await clerk.users.getUser(auth.userId);

  // Check if user has a @sentry.io email address
  const email = user.primaryEmailAddress?.emailAddress;
  if (!email || !email.endsWith("@sentry.io")) {
    return c.json(
      { error: "Access restricted to @sentry.io email addresses" },
      403
    );
  }

  c.set("user", user);
  c.set("auth", { userId: auth.userId, sessionId: auth.sessionId });
  await next();
};
