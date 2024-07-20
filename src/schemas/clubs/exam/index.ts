import { Type } from "@sinclair/typebox";
import { relations, sql } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static } from "elysia";
import { clubs } from "~/schemas/clubs";
import { medias } from "~/schemas/media";
import { examQuestions } from "./question";

export const exams = pgTable("exams", {
  id: serial("id").primaryKey(),
  clubId: integer("club_id").references(() => clubs.id, {
    onDelete: "cascade",
  }),
  imageId: integer("image_id").references(() => medias.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  description: text("description"),
  dueAt: timestamp("due_at").default(sql`now() + interval '1 day'`),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const examsRelations = relations(exams, ({ one, many }) => ({
  club: one(clubs, {
    fields: [exams.clubId],
    references: [clubs.id],
  }),
  questions: many(examQuestions),
  image: one(medias, {
    fields: [exams.imageId],
    references: [medias.id],
  }),
}));

export const InsertExamSchema = createInsertSchema(exams, {
  dueAt: Type.String(),
});
export const SelectExamSchema = createSelectSchema(exams);
export type ExamType = Static<typeof SelectExamSchema>;
