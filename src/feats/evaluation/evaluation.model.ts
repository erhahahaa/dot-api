import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { ClubModel } from "../club/club.model";
import { ExamModel } from "../exam";
import { QuestionModel } from "../question/question.model";
import { UserModel } from "../user/user.model";

export const EvaluationModel = pgTable("evaluations", {
  id: serial("id").primaryKey(),
  clubId: integer("club_id").references(() => ClubModel.id, {
    onDelete: "cascade",
  }),
  examId: integer("exam_id").references(() => ExamModel.id, {
    onDelete: "cascade",
  }),
  questionId: integer("question_id").references(() => QuestionModel.id, {
    onDelete: "cascade",
  }),
  athleteId: integer("user_id").references(() => UserModel.id, {
    onDelete: "cascade",
  }),
  coachId: integer("coach_id").references(() => UserModel.id, {
    onDelete: "cascade",
  }),
  answer: text("answer"),
  score: integer("score"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
