ALTER TABLE "tacticals" ADD COLUMN "board" json;--> statement-breakpoint
ALTER TABLE "tacticals" ADD COLUMN "team" json;--> statement-breakpoint
ALTER TABLE "tacticals" ADD COLUMN "strategic" json;--> statement-breakpoint
ALTER TABLE "tacticals" DROP COLUMN IF EXISTS "content";