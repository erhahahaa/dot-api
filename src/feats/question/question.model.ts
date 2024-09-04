import { relations } from "drizzle-orm";
import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { ExamModel } from "../exam/exam.model";
import { MediaModel } from "../media/media.model";
import { QuestionOption } from "./question.schema";

export const QuestionTypeEnumModel = pgEnum("question_type", [
  "text",
  "numeric",
]);

export const QuestionModel = pgTable("questions", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id").references(() => ExamModel.id, {
    onDelete: "cascade",
  }),
  mediaId: integer("media_id").references(() => MediaModel.id, {
    onDelete: "set null",
  }),
  order: integer("order"),
  type: QuestionTypeEnumModel("type").notNull(),
  question: text("question").notNull(),
  options: jsonb("options").$type<QuestionOption[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/// Relation
export const QuestionRelation = relations(QuestionModel, ({ one }) => ({
  exam: one(ExamModel, {
    fields: [QuestionModel.examId],
    references: [ExamModel.id],
  }),
  media: one(MediaModel, {
    fields: [QuestionModel.mediaId],
    references: [MediaModel.id],
  }),
}));
