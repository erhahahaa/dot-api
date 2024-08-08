ALTER TABLE "evaluations" DROP CONSTRAINT "evaluations_question_id_questions_id_fk";

ALTER TABLE "evaluations" ADD COLUMN "evaluations" jsonb;
ALTER TABLE "evaluations" DROP COLUMN IF EXISTS "question_id";
ALTER TABLE "evaluations" DROP COLUMN IF EXISTS "answer";
ALTER TABLE "evaluations" DROP COLUMN IF EXISTS "score";