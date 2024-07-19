import { relations } from "drizzle-orm";
import {
  foreignKey,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static } from "elysia";
import { clubs } from "~/schemas/clubs";

export const questionType = pgEnum("question_type", [
  "multipleChoice",
  "trueFalse",
  "shortAnswer",
  "essay",
]);

export const questions = pgTable(
  "questions",
  {
    id: serial("id").primaryKey().notNull(),
    clubId: serial("club_id").notNull(),
    examId: serial("exam_id").notNull(),
    type: questionType("type").notNull(),
    content: text("content").notNull(),
    answer: text("answer").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    clubReference: foreignKey({
      columns: [t.clubId],
      foreignColumns: [clubs.id],
    }),
  })
);

export const questionsRelations = relations(questions, ({ one }) => ({
  examId: one(clubs, {
    fields: [questions.examId],
    references: [clubs.id],
  }),
  club: one(clubs, {
    fields: [questions.clubId],
    references: [clubs.id],
  }),
}));

export const InsertQuestionSchema = createInsertSchema(questions);
export const SelectQuestionSchema = createSelectSchema(questions);
export type QuestionType = Static<typeof SelectQuestionSchema>;
