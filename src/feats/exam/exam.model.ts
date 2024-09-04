import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { ClubModel } from "../club/club.model";
import { EvaluationModel } from "../evaluation/evaluation.model";
import { MediaModel } from "../media/media.model";
import { QuestionModel } from "../question/question.model";

export const ExamModel = pgTable("exams", {
  id: serial("id").primaryKey(),
  clubId: integer("club_id").references(() => ClubModel.id, {
    onDelete: "cascade",
  }),
  mediaId: integer("media_id").references(() => MediaModel.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  description: text("description"),
  dueAt: timestamp("due_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/// Relation
export const ExamRelation = relations(ExamModel, ({ one, many }) => ({
  club: one(ClubModel, {
    fields: [ExamModel.clubId],
    references: [ClubModel.id],
  }),
  media: one(MediaModel, {
    fields: [ExamModel.mediaId],
    references: [MediaModel.id],
  }),
  questions: many(QuestionModel),
  evaluations: many(EvaluationModel),
}));
