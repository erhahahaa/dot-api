DO $$ BEGIN
 CREATE TYPE "public"."role" AS ENUM('superadmin', 'admin', 'user');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"image" text DEFAULT 'https://api.dicebear.com/9.x/adventurer/png' NOT NULL,
	"password" text NOT NULL,
	"role" "role",
	"expertise" text NOT NULL,
	"created_at" date DEFAULT CURRENT_DATE NOT NULL,
	"updated_at" date DEFAULT CURRENT_DATE NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
