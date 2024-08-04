import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static, t } from "elysia";
import { clubs } from "~/schemas/clubs";
import { medias } from "~/schemas/media";
import { TacticalBoard } from "~/types/tactical";

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
  board: jsonb("board").$type<TacticalBoard>(),
  // team: jsonb("team").$type<TacticalTeam>(),
  strategic: jsonb("strategic"),
  isLive: boolean("is_live").default(false),
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

export const StrategicSchema = t.Object({
  players: t.Array(
    t.Object({
      x: t.Number(),
      y: t.Number(),
      number: t.Number(),
      team: t.Number(),
      hexColor: t.Number(),
    })
  ),
  arrows: t.Array(
    t.Object({
      startX: t.Number(),
      startY: t.Number(),
      endX: t.Number(),
      endY: t.Number(),
    })
  ),
});

export const InsertTacticalSchema = createInsertSchema(tacticals, {
  board: t.Object({
    width: t.Number(),
    height: t.Number(),
  }),
  strategic: StrategicSchema,
});
export const SelectTacticalSchema = createSelectSchema(tacticals);
export type TacticalType = Static<typeof SelectTacticalSchema>;
