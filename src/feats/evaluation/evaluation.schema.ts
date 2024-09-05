import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static, t } from "elysia";
import { SelectClubSchema } from "../club/club.schema";
import { SelectExamSchema } from "../exam/exam.schema";
import { SelectUserSchema } from "../user/user.schema";
import { EvaluationModel } from "./evaluation.model";

export const QuestionEvaluationSchema = t.Object({
  questionId: t.Optional(t.Number()),
  answer: t.Optional(t.String()),
  score: t.Null(t.Number()),
  questionName: t.Optional(t.String()),
});

export type QuestionEvaluation = Static<typeof QuestionEvaluationSchema>;

export const InsertEvaluationSchema = createInsertSchema(EvaluationModel, {
  evaluations: t.Array(t.Partial(QuestionEvaluationSchema)),
});
export const SelectEvaluationSchema = createSelectSchema(EvaluationModel, {
  evaluations: t.Array(t.Partial(QuestionEvaluationSchema)),
});

export type Evaluation = Static<typeof SelectEvaluationSchema>;
export type InsertEvaluation = Static<typeof InsertEvaluationSchema>;

export const SelectEvaluationExtendedSchema = t.Composite([
  SelectEvaluationSchema,
  t.Object({
    club: SelectClubSchema,
    exam: SelectExamSchema,
    athlete: SelectUserSchema,
    coach: SelectUserSchema,
  }),
]);

export type EvaluationExtended = Static<typeof SelectEvaluationExtendedSchema>;
