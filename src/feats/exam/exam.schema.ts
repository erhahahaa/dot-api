import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static, t } from "elysia";
import { SelectMediaSchema } from "../media/media.schema";
import { ExamModel } from "./exam.model";

export const InsertExamSchema = createInsertSchema(ExamModel, {
  dueAt: t.Union([t.String(), t.Date()]),
});
export const SelectExamSchema = createSelectSchema(ExamModel, {
  dueAt: t.Union([t.String(), t.Date()]),
});

export type Exam = Static<typeof SelectExamSchema>;
export type InsertExam = Static<typeof InsertExamSchema>;

/// [Extras]

export const ExamExtendedSchema = t.Composite([
  SelectExamSchema,
  t.Partial(
    t.Object({
      media: t.Union([SelectMediaSchema, t.Null()]),
    })
  ),
]);

export type ExamExtended = Static<typeof ExamExtendedSchema>;
