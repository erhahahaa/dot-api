DO $$ BEGIN
 CREATE TYPE "public"."questionType" AS ENUM('multipleChoice', 'trueFalse', 'shortAnswer', 'essay');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."role" AS ENUM('superadmin', 'admin', 'user');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."userClubRole" AS ENUM('coach', 'athlete');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clubs" (
	"id" serial PRIMARY KEY NOT NULL,
	"creator_id" serial NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"image" text DEFAULT 'https://img.freepik.com/free-photo/sports-tools_53876-138077.jpg' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "exams" (
	"id" serial PRIMARY KEY NOT NULL,
	"club_id" serial NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"due_at" timestamp DEFAULT now() + interval '1 day',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"club_id" serial NOT NULL,
	"exam_id" serial NOT NULL,
	"type" "questionType" NOT NULL,
	"content" text NOT NULL,
	"answer" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tacticals" (
	"id" serial PRIMARY KEY NOT NULL,
	"club_id" serial NOT NULL,
	"sport_type" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"content" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"image" text DEFAULT 'https://api.dicebear.com/9.x/adventurer/png' NOT NULL,
	"password" text NOT NULL,
	"phone" text,
	"role" "role" DEFAULT 'user' NOT NULL,
	"expertise" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users_to_clubs" (
	"user_id" serial NOT NULL,
	"club_id" serial NOT NULL,
	"role" "userClubRole" DEFAULT 'athlete' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_to_clubs_user_id_club_id_pk" PRIMARY KEY("user_id","club_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clubs" ADD CONSTRAINT "clubs_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "exams" ADD CONSTRAINT "exams_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "questions" ADD CONSTRAINT "questions_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tacticals" ADD CONSTRAINT "tacticals_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_to_clubs" ADD CONSTRAINT "users_to_clubs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_to_clubs" ADD CONSTRAINT "users_to_clubs_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
