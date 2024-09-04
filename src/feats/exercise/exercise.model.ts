import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
// import { ProgramUnitValue } from "~/core/types/exercise";
import { relations } from "drizzle-orm";
import { MediaModel } from "../media/media.model";
import { ProgramModel } from "../program/program.model";
import { ExerciseUnitValue } from "./exercise.schema";

export const ExerciseModel = pgTable("exercises", {
  id: serial("id").primaryKey(),
  programId: integer("program_id").references(() => ProgramModel.id, {
    onDelete: "cascade",
  }),
  mediaId: integer("media_id").references(() => MediaModel.id, {
    onDelete: "set null",
  }),
  order: integer("order"),
  name: text("name").notNull(),
  description: text("description"),
  repetition: jsonb("repetition").$type<ExerciseUnitValue>(),
  sets: jsonb("sets").$type<ExerciseUnitValue>(),
  rest: jsonb("rest").$type<ExerciseUnitValue>(),
  tempo: jsonb("tempo").$type<ExerciseUnitValue>(),
  intensity: jsonb("intensity").$type<ExerciseUnitValue>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/// Relation
export const ExerciseRelation = relations(ExerciseModel, ({ one }) => ({
  program: one(ProgramModel, {
    fields: [ExerciseModel.programId],
    references: [ProgramModel.id],
  }),
  media: one(MediaModel, {
    fields: [ExerciseModel.mediaId],
    references: [MediaModel.id],
  }),
}));
