ALTER TABLE "events" ADD COLUMN "signup_mode" varchar(20) DEFAULT 'internal' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "external_url" text;