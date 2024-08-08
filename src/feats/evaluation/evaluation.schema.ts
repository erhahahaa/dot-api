import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static, t } from "elysia";
import { EvaluationModel } from "./evaluation.model";

export const QuestionEvaluationSchema = t.Object({
  questionId: t.Number(),
  answer: t.String(),
  score: t.Number(),
});

export type QuestionEvaluation = Static<typeof QuestionEvaluationSchema>;

export const InsertEvaluationSchema = createInsertSchema(EvaluationModel, {
  evaluations: t.Array(QuestionEvaluationSchema),
});
export const SelectEvaluationSchema = createSelectSchema(EvaluationModel, {
  evaluations: t.Array(QuestionEvaluationSchema),
});

export type Evaluation = Static<typeof SelectEvaluationSchema>;
export type InsertEvaluation = Static<typeof InsertEvaluationSchema>;
