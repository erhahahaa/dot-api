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
    club_id: serial("club_id").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    due_at: timestamp("due_at").default(sql`now() + interval '1 day'`),
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

export const examsRelations = relations(exams, ({ one, many }) => ({
  club: one(clubs, {
    fields: [exams.club_id],
    references: [clubs.id],
  }),
  questions: many(questions),
}));

export const InsertExamSchema = createInsertSchema(exams, {
  due_at: Type.String(),
});
export const SelectExamSchema = createSelectSchema(exams);
export type ExamType = Static<typeof SelectExamSchema>;
