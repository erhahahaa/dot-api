ALTER TABLE "exam_questions" RENAME COLUMN "content" TO "question";--> statement-breakpoint
ALTER TABLE "exam_questions" ADD COLUMN "options" jsonb;