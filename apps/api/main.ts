import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";

import { eventsApi } from "./routes/events";
import { meApi } from "./routes/me";
import { dbApi } from "./routes/db";
import { commentsApi } from "./routes/comments";

// Define environment variable types for Cloudflare Workers
export interface Env {
  DB: D1Database;
  CLERK_SECRET_KEY: string;
  CLERK_PUBLISHABLE_KEY: string;
  CORS_ORIGIN?: string;
}

// Define context variables that will be set by middleware
export type Variables = {
  user: any; // Clerk user object
  auth: {
    userId: string;
    sessionId: string;
  };
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.use("*", logger());

// CORS configuration for production
app.use("*", (c, next) => {
  const corsOrigin = c.env.CORS_ORIGIN || "http://localhost:5173";
  return cors({
    origin: corsOrigin.split(",").map((url) => url.trim()),
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })(c, next);
});

// Public API (no auth)
const publicApi = new Hono<{ Bindings: Env; Variables: Variables }>();
publicApi.get("/health", (c) => c.json({ status: "ok" }));

// Protected APIs mounted under their own prefixes
app.route("/events", eventsApi);
app.route("/me", meApi);
app.route("/db", dbApi);
app.route("/comments", commentsApi);

// Mount public router
app.route("/", publicApi);

// Export for Cloudflare Workers
export default app;
