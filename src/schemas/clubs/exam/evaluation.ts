import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static, t } from "elysia";
import { clubs } from "~/schemas/clubs";
import { users } from "~/schemas/users";
import { exams } from ".";
import { examQuestions } from "./question";

export const examEvaluations = pgTable("exam_evaluations", {
  id: serial("id").primaryKey(),
  clubId: integer("club_id").references(() => clubs.id, {
    onDelete: "cascade",
  }),
  examId: integer("exam_id").references(() => exams.id, {
    onDelete: "cascade",
  }),
  questionId: integer("question_id").references(() => examQuestions.id, {
    onDelete: "cascade",
  }),
  athleteId: integer("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  coachId: integer("coach_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  answer: text("answer"),
  score: integer("score"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const examEvaluationsRelations = relations(
  examEvaluations,
  ({ one }) => ({
    club: one(clubs, {
      fields: [examEvaluations.clubId],
      references: [clubs.id],
    }),
    exam: one(exams, {
      fields: [examEvaluations.examId],
      references: [exams.id],
    }),
    question: one(examQuestions, {
      fields: [examEvaluations.questionId],
      references: [examQuestions.id],
    }),
    athlete: one(clubs, {
      fields: [examEvaluations.athleteId],
      references: [clubs.id],
    }),
    coach: one(clubs, {
      fields: [examEvaluations.coachId],
      references: [clubs.id],
    }),
  })
);

export const InsertExamEvaluationSchema = createInsertSchema(examEvaluations, {
  coachId: t.Optional(t.Union([t.Number(), t.String()])),
});
export const SelectExamEvaluationSchema = createSelectSchema(examEvaluations);
export type EvaluationType = Static<typeof SelectExamEvaluationSchema>;
