import { relations } from "drizzle-orm";
import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";

import { Static, t } from "elysia";
import { medias } from "~/schemas/media";
import { ProgramUnitValue } from "~/types/exercise";
import { programs } from ".";

export const programExercises = pgTable("program_exercises", {
  id: serial("id").primaryKey(),
  programId: integer("program_id").references(() => programs.id, {
    onDelete: "cascade",
  }),
  mediaId: integer("media_id").references(() => medias.id, {
    onDelete: "set null",
  }),
  order: integer("order"),
  name: text("name").notNull(),
  description: text("description"),
  repetition: jsonb("repetition").$type<ProgramUnitValue>(),
  sets: jsonb("sets").$type<ProgramUnitValue>(),
  rest: jsonb("rest").$type<ProgramUnitValue>(),
  tempo: jsonb("tempo").$type<ProgramUnitValue>(),
  intesity: jsonb("intesity").$type<ProgramUnitValue>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const programExercisesRelations = relations(
  programExercises,
  ({ one }) => ({
    program: one(programs, {
      fields: [programExercises.programId],
      references: [programs.id],
    }),
    media: one(medias, {
      fields: [programExercises.mediaId],
      references: [medias.id],
    }),
  })
);

export const InsertProgramExerciseSchema = createInsertSchema(
  programExercises,
  {
    repetition: t.Object({
      unit: t.Optional(t.String()),
      value: t.Number(),
    }),
    sets: t.Object({
      unit: t.Optional(t.String()),
      value: t.Number(),
    }),
    rest: t.Object({
      unit: t.Optional(t.String()),
      value: t.Number(),
    }),
    tempo: t.Object({
      unit: t.Optional(t.String()),
      value: t.Number(),
    }),
    intesity: t.Object({
      unit: t.Optional(t.String()),
      value: t.Number(),
    }),
  }
);
export const SelectProgramExerciseSchema = createSelectSchema(programExercises);
export type ProgramType = Static<typeof SelectProgramExerciseSchema>;
