import { relations } from "drizzle-orm";
import {
  foreignKey,
  json,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static } from "elysia";
import { clubs } from "~/schemas/clubs";

export const tacticals = pgTable(
  "tacticals",
  {
    id: serial("id").primaryKey().notNull(),
    clubId: serial("club_id").notNull(),
    sportType: text("sport_type").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    content: json("content"),
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

export const tacticalRelations = relations(tacticals, ({ one, many }) => ({
  club: one(clubs, {
    fields: [tacticals.clubId],
    references: [clubs.id],
  }),
}));

export const InsertTacticalSchema = createInsertSchema(tacticals);
export const SelectTacticalSchema = createSelectSchema(tacticals);
export type TacticalType = Static<typeof SelectTacticalSchema>;
