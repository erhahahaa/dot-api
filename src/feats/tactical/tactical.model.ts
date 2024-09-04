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
import { ClubModel } from "../club/club.model";
import { MediaModel } from "../media/media.model";
import { TacticalBoard, TacticalStrategic } from "./tactical.schema";

export const TacticalModel = pgTable("tacticals", {
  id: serial("id").primaryKey(),
  clubId: integer("club_id").references(() => ClubModel.id, {
    onDelete: "cascade",
  }),
  mediaId: integer("media_id").references(() => MediaModel.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  description: text("description"),
  board: jsonb("board").$type<TacticalBoard>(),
  strategic: jsonb("strategic").$type<TacticalStrategic>(),
  isLive: boolean("is_live").default(false),
  host: text("host"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/// Relation
export const TacticalRelation = relations(TacticalModel, ({ one }) => ({
  club: one(ClubModel, {
    fields: [TacticalModel.clubId],
    references: [ClubModel.id],
  }),
  media: one(MediaModel, {
    fields: [TacticalModel.mediaId],
    references: [MediaModel.id],
  }),
}));
