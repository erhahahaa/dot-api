import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static, t } from "elysia";
import { SelectMediaSchema } from "../media/media.schema";
import { QuestionModel } from "./question.model";

export const QuestionOptionSchema = t.Object({
  order: t.Number(),
  text: t.String(),
});

export const InsertQuestionSchema = createInsertSchema(QuestionModel, {
  options: t.Array(QuestionOptionSchema),
});
export const SelectQuestionSchema = createSelectSchema(QuestionModel, {
  options: t.Array(QuestionOptionSchema),
});

export type QuestionOption = Static<typeof QuestionOptionSchema>;
export type Question = Static<typeof SelectQuestionSchema>;
export type InsertQuestion = Static<typeof InsertQuestionSchema>;

/// [Extras] Extended schema
export const SelectQuestionExtendedSchema = t.Composite([
  SelectQuestionSchema,
  t.Partial(
    t.Object({
      media: t.Union([SelectMediaSchema, t.Null()]),
    })
  ),
]);

export type QuestionExtended = Static<typeof SelectQuestionExtendedSchema>;
