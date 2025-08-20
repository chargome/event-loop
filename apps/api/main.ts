import { Hono } from "@hono/hono";
import { logger } from "@hono/logger";
import { cors } from "@hono/cors";

import { eventsApi } from "./routes/events.ts";
import { meApi } from "./routes/me.ts";
import { dbApi } from "./routes/db.ts";
import { commentsApi } from "./routes/comments.ts";

const app = new Hono();

app.use("*", logger());
app.use("*", cors());

// Public API (no auth)
const publicApi = new Hono();
publicApi.get("/health", (c) => c.json({ status: "ok" }));

// Protected APIs mounted under their own prefixes
app.route("/events", eventsApi);
app.route("/me", meApi);
app.route("/db", dbApi);
app.route("/comments", commentsApi);

// Mount public router and start server
app.route("/", publicApi);

Deno.serve({ port: 8787 }, app.fetch);
