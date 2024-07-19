import { Type } from "@sinclair/typebox";
import { relations } from "drizzle-orm";
import {
  foreignKey,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";

import { Static } from "elysia";
import { programs } from ".";

export const programExercises = pgTable(
  "program_exercises",
  {
    id: serial("id").primaryKey().notNull(),
    programId: serial("program_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    repetition: integer("repetition"),
    sets: integer("sets"),
    rest: integer("rest"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    programReference: foreignKey({
      columns: [t.programId],
      foreignColumns: [programs.id],
    }),
  })
);

export const programExercisesRelations = relations(
  programExercises,
  ({ one }) => ({
    program: one(programs, {
      fields: [programExercises.programId],
      references: [programs.id],
    }),
  })
);

export const InsertProgramExerciseSchema = createInsertSchema(
  programExercises,
  {
    programId: Type.Optional(Type.Number()),
  }
);
export const SelectProgramExerciseSchema = createSelectSchema(programExercises);
export type ProgramType = Static<typeof SelectProgramExerciseSchema>;
