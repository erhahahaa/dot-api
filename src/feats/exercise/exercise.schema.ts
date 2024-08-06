import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static, t } from "elysia";
import { SelectMediaSchema } from "../media/media.schema";
import { ExerciseModel } from "./exercise.model";

export const ExerciseUnitValueSchema = t.Object({
  unit: t.Optional(t.String()),
  value: t.Number(),
});

export const InsertExerciseSchema = createInsertSchema(ExerciseModel, {
  repetition: ExerciseUnitValueSchema,
  sets: ExerciseUnitValueSchema,
  rest: ExerciseUnitValueSchema,
  tempo: ExerciseUnitValueSchema,
  intensity: ExerciseUnitValueSchema,
});
export const SelectExerciseSchema = createSelectSchema(ExerciseModel, {
  repetition: ExerciseUnitValueSchema,
  sets: ExerciseUnitValueSchema,
  rest: ExerciseUnitValueSchema,
  tempo: ExerciseUnitValueSchema,
  intensity: ExerciseUnitValueSchema,
});

export type Exercise = Static<typeof SelectExerciseSchema>;
export type InsertExercise = Static<typeof InsertExerciseSchema>;
export type ExerciseUnitValue = Static<typeof ExerciseUnitValueSchema>;

/// [Extras] Extended schema
export const SelectExerciseExtendedSchema = t.Composite([
  SelectExerciseSchema,
  t.Partial(
    t.Object({
      media: t.Union([SelectMediaSchema, t.Null()]),
    })
  ),
]);

export type ExerciseExtended = Static<typeof SelectExerciseExtendedSchema>;
