import { relations } from "drizzle-orm";
import {
  integer,
  jsonb,
  pgTable,
  serial,
  timestamp,
} from "drizzle-orm/pg-core";
import { ClubModel } from "../club/club.model";
import { ExamModel } from "../exam/exam.model";
import { UserModel } from "../user/user.model";
import { QuestionEvaluation } from "./evaluation.schema";

export const EvaluationModel = pgTable("evaluations", {
  id: serial("id").primaryKey(),
  clubId: integer("club_id").references(() => ClubModel.id, {
    onDelete: "cascade",
  }),
  examId: integer("exam_id").references(() => ExamModel.id, {
    onDelete: "cascade",
  }),
  athleteId: integer("user_id").references(() => UserModel.id, {
    onDelete: "cascade",
  }),
  coachId: integer("coach_id").references(() => UserModel.id, {
    onDelete: "cascade",
  }),
  evaluations: jsonb("evaluations").$type<QuestionEvaluation[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/// Relation
export const EvaluationRelation = relations(EvaluationModel, ({ one }) => ({
  club: one(ClubModel, {
    fields: [EvaluationModel.clubId],
    references: [ClubModel.id],
  }),
  exam: one(ExamModel, {
    fields: [EvaluationModel.examId],
    references: [ExamModel.id],
  }),
  athlete: one(UserModel, {
    fields: [EvaluationModel.athleteId],
    references: [UserModel.id],
    relationName: "evaluation_athlete",
  }),
  coach: one(UserModel, {
    fields: [EvaluationModel.coachId],
    references: [UserModel.id],
    relationName: "evaluation_coach",
  }),
}));
