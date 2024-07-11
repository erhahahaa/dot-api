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
    club_id: serial("club_id").notNull(),
    exam_id: serial("exam_id").notNull(),
    type: questionType("type").notNull(),
    content: text("content").notNull(),
    answer: text("answer").notNull(),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    clubReference: foreignKey({
      columns: [t.club_id],
      foreignColumns: [clubs.id],
    }),
  })
);

export const questionsRelations = relations(questions, ({ one }) => ({
  exam_id: one(clubs, {
    fields: [questions.exam_id],
    references: [clubs.id],
  }),
  club: one(clubs, {
    fields: [questions.club_id],
    references: [clubs.id],
  }),
}));

export const InsertQuestionSchema = createInsertSchema(questions);
export const SelectQuestionSchema = createSelectSchema(questions);
export type QuestionType = Static<typeof SelectQuestionSchema>;
