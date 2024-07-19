ALTER TABLE "program_exercises" ADD COLUMN "description" text NOT NULL;--> statement-breakpoint
ALTER TABLE "program_exercises" ADD COLUMN "repetition" integer;--> statement-breakpoint
ALTER TABLE "program_exercises" ADD COLUMN "sets" integer;--> statement-breakpoint
ALTER TABLE "program_exercises" ADD COLUMN "rest" integer;--> statement-breakpoint
ALTER TABLE "program_exercises" DROP COLUMN IF EXISTS "sport_type";--> statement-breakpoint
ALTER TABLE "program_exercises" DROP COLUMN IF EXISTS "start_date";--> statement-breakpoint
ALTER TABLE "program_exercises" DROP COLUMN IF EXISTS "end_date";--> statement-breakpoint
ALTER TABLE "program_exercises" DROP COLUMN IF EXISTS "exercises";--> statement-breakpoint
ALTER TABLE "programs" DROP COLUMN IF EXISTS "sport_type";