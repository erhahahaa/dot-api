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
import { programs } from "../programs";

export const questionType = pgEnum("questionType", [
  "multipleChoice",
  "trueFalse",
  "shortAnswer",
  "essay",
]);

export const questions = pgTable(
  "questions",
  {
    id: serial("id").primaryKey().notNull(),
    program_id: serial("program_id").notNull(),
    exam_id: serial("exam_id").notNull(),
    type: questionType("type").notNull(),
    content: text("content").notNull(),
    answer: text("answer").notNull(),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    programReference: foreignKey({
      columns: [t.program_id],
      foreignColumns: [programs.id],
    }),
  })
);

export const questionsRelations = relations(questions, ({ one }) => ({
  exam_id: one(programs, {
    fields: [questions.exam_id],
    references: [programs.id],
  }),
  program: one(programs, {
    fields: [questions.program_id],
    references: [programs.id],
  }),
}));

export const InsertQuestionSchema = createInsertSchema(questions);
export const SelectQuestionSchema = createSelectSchema(questions);
export type QuestionType = Static<typeof SelectQuestionSchema>;
