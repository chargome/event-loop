import {
  sqliteTable,
  integer,
  text,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  office: text("office", { enum: ["VIE", "SFO", "YYZ", "AMS", "SEA"] })
    .default("VIE")
    .notNull(),
  startsAt: integer("starts_at", { mode: "timestamp" }).notNull(),
  capacity: integer("capacity"),
  signupMode: text("signup_mode", { enum: ["internal", "external"] })
    .default("internal")
    .notNull(),
  externalUrl: text("external_url"),
  isPublic: integer("is_public", { mode: "boolean" }).default(true).notNull(),
  status: text("status", { enum: ["active", "cancelled"] })
    .default("active")
    .notNull(),
  createdBy: integer("created_by").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

export const rsvps = sqliteTable(
  "rsvps",
  {
    userId: integer("user_id").notNull(),
    eventId: integer("event_id").notNull(),
    status: text("status", {
      enum: ["going", "waitlist", "cancelled"],
    }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.eventId] }),
    byEvent: uniqueIndex("rsvps_user_event_unique").on(
      table.userId,
      table.eventId
    ),
  })
);

export const comments = sqliteTable("comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});
