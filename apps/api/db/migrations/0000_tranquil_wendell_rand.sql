CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"location" varchar(255),
	"starts_at" timestamp NOT NULL,
	"capacity" integer,
	"is_public" boolean DEFAULT true NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rsvps" (
	"user_id" integer NOT NULL,
	"event_id" integer NOT NULL,
	"status" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rsvps_user_id_event_id_pk" PRIMARY KEY("user_id","event_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" text,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "rsvps_user_event_unique" ON "rsvps" USING btree ("user_id","event_id");