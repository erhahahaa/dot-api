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
    club_id: serial("club_id").notNull(),
    sport_type: text("sport_type").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    content: json("content"),
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

export const tacticalRelations = relations(tacticals, ({ one, many }) => ({
  club: one(clubs, {
    fields: [tacticals.club_id],
    references: [clubs.id],
  }),
}));

export const InsertTacticalSchema = createInsertSchema(tacticals);
export const SelectTacticalSchema = createSelectSchema(tacticals);
export type TacticalType = Static<typeof SelectTacticalSchema>;
