import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  startsAt: timestamp("starts_at", { withTimezone: false }).notNull(),
  capacity: integer("capacity"),
  signupMode: varchar("signup_mode", { length: 20 })
    .$type<"internal" | "external">()
    .default("internal")
    .notNull(),
  externalUrl: text("external_url"),
  isPublic: boolean("is_public").default(true).notNull(),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
});

export const rsvps = pgTable(
  "rsvps",
  {
    userId: integer("user_id").notNull(),
    eventId: integer("event_id").notNull(),
    status: varchar("status", { length: 20 })
      .$type<"going" | "waitlist" | "cancelled">()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: false })
      .defaultNow()
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
