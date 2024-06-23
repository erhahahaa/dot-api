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
import { programs } from "../programs"; 
import { questions } from "./question";

export const exams = pgTable(
  "exams",
  {
    id: serial("id").primaryKey().notNull(),
    program_id: serial("program_id").notNull(),
    title: text("title").notNull(),
    decription: text("description"),
    due_at: timestamp("due_at").default(sql`now() + interval '1 day'`),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    programReference: foreignKey({
      columns: [t.program_id],
      foreignColumns: [programs.id],
    }),
  })
);

export const examsRelations = relations(exams, ({ one, many }) => ({
  program: one(programs, {
    fields: [exams.program_id],
    references: [programs.id],
  }),
  questions:many(questions)
}));

export const InsertExamSchema = createInsertSchema(exams);
export const SelectExamSchema = createSelectSchema(exams);
export type ExamType = Static<typeof SelectExamSchema>;
