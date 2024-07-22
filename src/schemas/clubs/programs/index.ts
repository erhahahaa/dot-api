import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static, t } from "elysia";
import { clubs } from "~/schemas/clubs";
import { medias } from "~/schemas/media";
import { programExercises } from "./exercise";

export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  clubId: integer("club_id").references(() => clubs.id, {
    onDelete: "cascade",
  }),
  mediaId: integer("media_id").references(() => medias.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const programsRelations = relations(programs, ({ one, many }) => ({
  club: one(clubs, {
    fields: [programs.clubId],
    references: [clubs.id],
  }),
  media: one(medias, {
    fields: [programs.mediaId],
    references: [medias.id],
  }),
  exercises: many(programExercises),
}));

export const InsertProgramSchema = createInsertSchema(programs, {
  startDate: t.Union([t.String(), t.Date()]),
  endDate: t.Union([t.String(), t.Date()]),
});
export const SelectProgramSchema = createSelectSchema(programs);
export type ProgramType = Static<typeof SelectProgramSchema>;
