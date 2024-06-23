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
 CREATE TYPE "public"."userProgramRole" AS ENUM('coach', 'athlete');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "exams" (
	"id" serial PRIMARY KEY NOT NULL,
	"program_id" serial NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"due_at" timestamp DEFAULT now() + interval '1 day',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"program_id" serial NOT NULL,
	"exam_id" serial NOT NULL,
	"type" "questionType" NOT NULL,
	"content" text NOT NULL,
	"answer" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"creator_id" serial NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"image" text DEFAULT 'https://img.freepik.com/free-photo/sports-tools_53876-138077.jpg' NOT NULL,
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
CREATE TABLE IF NOT EXISTS "users_to_programs" (
	"user_id" serial NOT NULL,
	"program_id" serial NOT NULL,
	"role" "userProgramRole" DEFAULT 'athlete' NOT NULL,
	CONSTRAINT "users_to_programs_user_id_program_id_pk" PRIMARY KEY("user_id","program_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "exams" ADD CONSTRAINT "exams_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "questions" ADD CONSTRAINT "questions_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "programs" ADD CONSTRAINT "programs_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_to_programs" ADD CONSTRAINT "users_to_programs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_to_programs" ADD CONSTRAINT "users_to_programs_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
