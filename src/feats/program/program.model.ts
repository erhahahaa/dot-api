import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { ClubModel } from "../club/club.model";
import { ExerciseModel } from "../exercise/exercise.model";
import { MediaModel } from "../media/media.model";

export const ProgramModel = pgTable("programs", {
  id: serial("id").primaryKey(),
  clubId: integer("club_id").references(() => ClubModel.id, {
    onDelete: "cascade",
  }),
  mediaId: integer("media_id").references(() => MediaModel.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/// Relation
export const ProgramRelation = relations(ProgramModel, ({ one, many }) => ({
  club: one(ClubModel, {
    fields: [ProgramModel.clubId],
    references: [ClubModel.id],
  }),
  media: one(MediaModel, {
    fields: [ProgramModel.mediaId],
    references: [MediaModel.id],
  }),
  exercises: many(ExerciseModel),
}));
