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
import { programs } from "../programs";

export const tacticals = pgTable(
  "tacticals",
  {
    id: serial("id").primaryKey().notNull(),
    program_id: serial("program_id").notNull(),
    sport_type: text("sport_type").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    content: json("content"),
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

export const tacticalRelations = relations(tacticals, ({ one, many }) => ({
  program: one(programs, {
    fields: [tacticals.program_id],
    references: [programs.id],
  }),
}));

export const InsertTacticalSchema = createInsertSchema(tacticals);
export const SelectTacticalSchema = createSelectSchema(tacticals);
export type TacticalType = Static<typeof SelectTacticalSchema>;
