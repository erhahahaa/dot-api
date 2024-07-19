CREATE TABLE IF NOT EXISTS "program_exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"program_id" serial NOT NULL,
	"sport_type" text NOT NULL,
	"name" text NOT NULL,
	"start_date" timestamp DEFAULT now(),
	"end_date" timestamp DEFAULT now(),
	"exercises" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "clubs" ALTER COLUMN "image" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "clubs" ALTER COLUMN "image" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "programs" ADD COLUMN "start_date" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "programs" ADD COLUMN "end_date" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "programs" ADD COLUMN "exercises" json;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "program_exercises" ADD CONSTRAINT "program_exercises_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "programs" DROP COLUMN IF EXISTS "content";