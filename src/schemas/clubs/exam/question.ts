import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static } from "elysia";
import { medias } from "~/schemas/media";
import { exams } from ".";

export const questionType = pgEnum("question_type", [
  "multipleChoice",
  "trueFalse",
  "shortAnswer",
  "essay",
]);

export const examQuestions = pgTable("exam_questions", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id").references(() => exams.id, {
    onDelete: "cascade",
  }),
  mediaId: integer("media_id").references(() => medias.id, {
    onDelete: "set null",
  }),
  type: questionType("type").notNull(),
  content: text("content").notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const examQuestionsRelations = relations(examQuestions, ({ one }) => ({
  exam: one(exams, {
    fields: [examQuestions.examId],
    references: [exams.id],
  }),
  media: one(medias, {
    fields: [examQuestions.mediaId],
    references: [medias.id],
  }),
}));

export const InsertExamQuestionSchema = createInsertSchema(examQuestions);
export const SelectExamQuestionSchema = createSelectSchema(examQuestions);
export type QuestionType = Static<typeof SelectExamQuestionSchema>;
