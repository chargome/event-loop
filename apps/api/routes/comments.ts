import { Hono } from "hono";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../auth/clerk";
import { createDb } from "../db/client";
import { comments, users } from "../db/schema";
import type { Env, Variables } from "../main";

export const commentsApi = new Hono<{ Bindings: Env; Variables: Variables }>();

// Protect all comment routes
commentsApi.use("*", requireAuth);

// GET /comments/:eventId - Get comments for an event
commentsApi.get("/:eventId", async (c) => {
  const { db } = createDb(c);
  try {
    const eventId = Number(c.req.param("eventId"));
    if (!Number.isFinite(eventId))
      return c.json({ error: "Invalid event ID" }, 400);

    // Get comments with user info using Drizzle ORM joins
    const commentsRes = await db
      .select({
        id: comments.id,
        content: comments.content,
        created_at: comments.createdAt,
        updated_at: comments.updatedAt,
        user_id: users.id,
        name: users.name,
        email: users.email,
        avatar_url: users.avatarUrl,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.eventId, eventId))
      .orderBy(desc(comments.createdAt));

    return c.json({ comments: commentsRes });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return c.json({ error: String(error) }, 500);
  }
});

// POST /comments/:eventId - Add a comment to an event
commentsApi.post("/:eventId", async (c) => {
  const { db } = createDb(c);
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
      const [newUser] = await db
        .insert(users)
        .values({
          email: user.primaryEmailAddress?.emailAddress || "",
          name: user.fullName || null,
          avatarUrl: user.imageUrl || null,
        })
        .returning({ id: users.id });
      dbUserId = newUser.id;
    } else {
      dbUserId = existingUsers[0].id;
    }

    // Insert comment
    const [insertedComment] = await db
      .insert(comments)
      .values({
        eventId,
        userId: dbUserId,
        content,
      })
      .returning({ id: comments.id });

    // Get the comment with user info for response
    const [commentWithUser] = await db
      .select({
        id: comments.id,
        content: comments.content,
        created_at: comments.createdAt,
        updated_at: comments.updatedAt,
        user_id: users.id,
        name: users.name,
        email: users.email,
        avatar_url: users.avatarUrl,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.id, insertedComment.id));

    return c.json({ comment: commentWithUser }, 201);
  } catch (error) {
    console.error("Error creating comment:", error);
    return c.json({ error: String(error) }, 500);
  }
});
