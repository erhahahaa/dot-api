DO $$ BEGIN
 CREATE TYPE "public"."sport_type" AS ENUM('volleyBall', 'basketBall', 'soccer');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."question_type" AS ENUM('multipleChoice', 'trueFalse', 'shortAnswer', 'essay');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."media_parent" AS ENUM('club', 'program', 'exercise', 'exam', 'question', 'tactical', 'user');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."media_type" AS ENUM('image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-word', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-excel', 'text/plain', 'video/mp4', 'video/avi', 'video/mpeg', 'video/quicktime', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'application/zip', 'application/x-rar-compressed', 'application/octet-stream');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."user_gender" AS ENUM('male', 'female');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."user_role" AS ENUM('coach', 'athlete');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "clubs" (
	"id" serial PRIMARY KEY NOT NULL,
	"creator_id" integer,
	"media_id" integer,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"type" "sport_type" NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "evaluations" (
	"id" serial PRIMARY KEY NOT NULL,
	"club_id" integer,
	"exam_id" integer,
	"question_id" integer,
	"user_id" integer,
	"coach_id" integer,
	"answer" text,
	"score" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "exams" (
	"id" serial PRIMARY KEY NOT NULL,
	"club_id" integer,
	"media_id" integer,
	"title" text NOT NULL,
	"description" text,
	"due_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"exam_id" integer,
	"media_id" integer,
	"order" integer,
	"type" "question_type" NOT NULL,
	"question" text NOT NULL,
	"options" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "medias" (
	"id" serial PRIMARY KEY NOT NULL,
	"creator_id" integer,
	"club_id" integer,
	"name" text NOT NULL,
	"file_size" integer,
	"path" text,
	"type" "media_type" NOT NULL,
	"parent" "media_parent" NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"club_id" integer,
	"media_id" integer,
	"name" text NOT NULL,
	"start_date" timestamp DEFAULT now(),
	"end_date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"program_id" integer,
	"media_id" integer,
	"order" integer,
	"name" text NOT NULL,
	"description" text,
	"repetition" jsonb,
	"sets" jsonb,
	"rest" jsonb,
	"tempo" jsonb,
	"intensity" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "tacticals" (
	"id" serial PRIMARY KEY NOT NULL,
	"club_id" integer,
	"media_id" integer,
	"name" text NOT NULL,
	"description" text,
	"board" jsonb,
	"strategic" jsonb,
	"is_live" boolean DEFAULT false,
	"host" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"username" text NOT NULL,
	"image" text DEFAULT 'https://api.dicebear.com/9.x/adventurer/png' NOT NULL,
	"password" text NOT NULL,
	"phone" bigint NOT NULL,
	"gender" "user_gender",
	"role" "user_role" DEFAULT 'athlete' NOT NULL,
	"born_place" text,
	"born_date" timestamp,
	"religion" text,
	"address" text,
	"expertise" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "users_to_clubs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"club_id" integer NOT NULL,
	"role" "user_role" DEFAULT 'athlete' NOT NULL,
	"created_at" timestamp DEFAULT now()
);

DO $$ BEGIN
 ALTER TABLE "clubs" ADD CONSTRAINT "clubs_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "clubs" ADD CONSTRAINT "clubs_media_id_medias_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."medias"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_coach_id_users_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "exams" ADD CONSTRAINT "exams_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "exams" ADD CONSTRAINT "exams_media_id_medias_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."medias"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "questions" ADD CONSTRAINT "questions_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "questions" ADD CONSTRAINT "questions_media_id_medias_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."medias"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "medias" ADD CONSTRAINT "medias_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "medias" ADD CONSTRAINT "medias_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "programs" ADD CONSTRAINT "programs_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "programs" ADD CONSTRAINT "programs_media_id_medias_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."medias"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "exercises" ADD CONSTRAINT "exercises_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "exercises" ADD CONSTRAINT "exercises_media_id_medias_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."medias"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "tacticals" ADD CONSTRAINT "tacticals_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "tacticals" ADD CONSTRAINT "tacticals_media_id_medias_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."medias"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "users_to_clubs" ADD CONSTRAINT "users_to_clubs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "users_to_clubs" ADD CONSTRAINT "users_to_clubs_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "email_idx" ON "users" USING btree ("email");
CREATE UNIQUE INDEX IF NOT EXISTS "username_idx" ON "users" USING btree ("username");