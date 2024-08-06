import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { ClubModel } from "../club/club.model";
import { MediaModel } from "../media/media.model";

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

// export const QuestionTypeEnumModel = pgEnum("question_type", [
//   "multipleChoice",
//   "trueFalse",
//   "shortAnswer",
//   "essay",
// ]);

// export const QuestionModel = pgTable("questions", {
//   id: serial("id").primaryKey(),
//   examId: integer("exam_id").references(() => ExamModel.id, {
//     onDelete: "cascade",
//   }),
//   mediaId: integer("media_id").references(() => MediaModel.id, {
//     onDelete: "set null",
//   }),
//   order: integer("order"),
//   type: QuestionTypeEnumModel("type").notNull(),
//   question: text("question").notNull(),
//   options: jsonb("options").$type<QuestionOption[]>(),
//   createdAt: timestamp("created_at").defaultNow(),
//   updatedAt: timestamp("updated_at").defaultNow(),
// });

// export const EvaluationModel = pgTable("evaluations", {
//   id: serial("id").primaryKey(),
//   clubId: integer("club_id").references(() => ClubModel.id, {
//     onDelete: "cascade",
//   }),
//   examId: integer("exam_id").references(() => ExamModel.id, {
//     onDelete: "cascade",
//   }),
//   questionId: integer("question_id").references(() => QuestionModel.id, {
//     onDelete: "cascade",
//   }),
//   athleteId: integer("user_id").references(() => UserModel.id, {
//     onDelete: "cascade",
//   }),
//   coachId: integer("coach_id").references(() => UserModel.id, {
//     onDelete: "cascade",
//   }),
//   answer: text("answer"),
//   score: integer("score"),
//   createdAt: timestamp("created_at").defaultNow(),
//   updatedAt: timestamp("updated_at").defaultNow(),
// });
