import { Hono } from "@hono/hono";
import { eq } from "drizzle-orm";
import { requireAuth } from "../auth/clerk.ts";
import { createDb } from "../db/client.ts";
import { comments, users } from "../db/schema.ts";

export const commentsApi = new Hono();

// Protect all comment routes
commentsApi.use("*", requireAuth);

// GET /comments/:eventId - Get comments for an event
commentsApi.get("/:eventId", async (c) => {
  const { db, client } = await createDb();
  try {
    const eventId = Number(c.req.param("eventId"));
    if (!Number.isFinite(eventId))
      return c.json({ error: "Invalid event ID" }, 400);

    // Get comments with user info
    const commentsRes = await client.query(
      `select c.id, c.content, c.created_at, c.updated_at,
              u.id as user_id, u.name, u.email, u.avatar_url
       from comments c
       join users u on c.user_id = u.id
       where c.event_id = $1
       order by c.created_at desc`,
      [eventId]
    );

    await client.end();
    return c.json({ comments: commentsRes.rows });
  } catch (error) {
    try {
      await client.end();
    } catch {}
    return c.json({ error: String(error) }, 500);
  }
});

// POST /comments/:eventId - Add a comment to an event
commentsApi.post("/:eventId", async (c) => {
  const { db, client } = await createDb();
  try {
    const eventId = Number(c.req.param("eventId"));
    if (!Number.isFinite(eventId))
      return c.json({ error: "Invalid event ID" }, 400);

    const body = await c.req.json();
    const content =
      typeof body?.content === "string" ? body.content.trim() : "";
    if (!content) return c.json({ error: "Comment content is required" }, 400);

    // Get user info from Clerk auth context
    const user = c.get("user");
    if (!user?.id) return c.json({ error: "Unauthorized" }, 401);

    // Ensure user exists in our database
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, user.primaryEmailAddress?.emailAddress || ""));

    let dbUserId: number;
    if (existingUsers.length === 0) {
      // Create user record
      const newUser = await db
        .insert(users)
        .values({
          email: user.primaryEmailAddress?.emailAddress || "",
          name: user.fullName || null,
          avatarUrl: user.imageUrl || null,
        })
        .returning();
      dbUserId = newUser[0].id;
    } else {
      dbUserId = existingUsers[0].id;
    }

    // Insert comment
    const insertedComment = await db
      .insert(comments)
      .values({
        eventId,
        userId: dbUserId,
        content,
      })
      .returning();

    // Get the comment with user info for response
    const commentWithUser = await client.query(
      `select c.id, c.content, c.created_at, c.updated_at,
              u.id as user_id, u.name, u.email, u.avatar_url
       from comments c
       join users u on c.user_id = u.id
       where c.id = $1`,
      [insertedComment[0].id]
    );

    await client.end();
    return c.json({ comment: commentWithUser.rows[0] }, 201);
  } catch (error) {
    try {
      await client.end();
    } catch {}
    return c.json({ error: String(error) }, 500);
  }
});
