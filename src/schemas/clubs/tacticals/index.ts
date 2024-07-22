import { relations } from "drizzle-orm";
import {
  integer,
  json,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static, t } from "elysia";
import { clubs } from "~/schemas/clubs";
import { medias } from "~/schemas/media";
import {
  TacticalBoard,
  TacticalStrategic,
  TacticalTeam,
} from "~/types/tactical";

export const tacticals = pgTable("tacticals", {
  id: serial("id").primaryKey(),
  clubId: integer("club_id").references(() => clubs.id, {
    onDelete: "cascade",
  }),
  mediaId: integer("media_id").references(() => medias.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  description: text("description"),
  board: json("board").$type<TacticalBoard>(),
  team: json("team").$type<TacticalTeam>(),
  strategic: json("strategic").$type<TacticalStrategic>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tacticalRelations = relations(tacticals, ({ one }) => ({
  club: one(clubs, {
    fields: [tacticals.clubId],
    references: [clubs.id],
  }),
  media: one(medias, {
    fields: [tacticals.mediaId],
    references: [medias.id],
  }),
}));

export const InsertTacticalSchema = createInsertSchema(tacticals, {
  board: t.Object({
    type: t.String(),
    name: t.String(),
    url: t.String(),
  }),
  team: t.Object({
    name: t.String(),
    color: t.String(),
    totalMembers: t.Number(),
    members: t.Array(
      t.Object({
        name: t.String(),
        number: t.Number(),
      })
    ),
  }),
  strategic: t.Record(
    t.String(),
    t.Record(
      t.Number(),
      t.Object({
        x: t.Number(),
        y: t.Number(),
      })
    )
  ),
});
export const SelectTacticalSchema = createSelectSchema(tacticals);
export type TacticalType = Static<typeof SelectTacticalSchema>;
