import { Type } from "@sinclair/typebox";
import { relations, sql } from "drizzle-orm";
import {
  foreignKey,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static } from "elysia";
import { clubs } from "~/schemas/clubs";
import { questions } from "~/schemas/clubs/exam/question";

export const exams = pgTable(
  "exams",
  {
    id: serial("id").primaryKey().notNull(),
    clubId: serial("club_id").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    dueAt: timestamp("due_at").default(sql`now() + interval '1 day'`),
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

export const examsRelations = relations(exams, ({ one, many }) => ({
  club: one(clubs, {
    fields: [exams.clubId],
    references: [clubs.id],
  }),
  questions: many(questions),
}));

export const InsertExamSchema = createInsertSchema(exams, {
  dueAt: Type.String(),
});
export const SelectExamSchema = createSelectSchema(exams);
export type ExamType = Static<typeof SelectExamSchema>;
