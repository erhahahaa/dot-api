import { relations } from "drizzle-orm";
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

export const programs = pgTable(
  "programs",
  {
    id: serial("id").primaryKey().notNull(),
    clubId: serial("club_id").notNull(),
    name: text("name").notNull(),
    startDate: timestamp("start_date").defaultNow(),
    endDate: timestamp("end_date").defaultNow(),
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

export const programRelations = relations(programs, ({ one }) => ({
  club: one(clubs, {
    fields: [programs.clubId],
    references: [clubs.id],
  }),
}));

export const InsertProgramSchema = createInsertSchema(programs);
export const SelectProgramSchema = createSelectSchema(programs);
export type ProgramType = Static<typeof SelectProgramSchema>;
