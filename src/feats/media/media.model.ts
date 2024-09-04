import { relations } from "drizzle-orm";
import {
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { ClubModel } from "../club/club.model";
import { UserModel } from "../user/user.model";

export const MediaTypeEnumModel = pgEnum("media_type", [
  // IMAGE
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/svg+xml",
  "video/mp4",
]);

export const MediaParentEnumModel = pgEnum("media_parent", [
  "club",
  "program",
  "exercise",
  "exam",
  "question",
  "tactical",
  "user",
]);

export const MediaModel = pgTable("medias", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => UserModel.id, {
    onDelete: "set null",
  }),
  clubId: integer("club_id").references(() => ClubModel.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  fileSize: integer("file_size"),
  path: text("path"),
  type: MediaTypeEnumModel("type").notNull(),
  parent: MediaParentEnumModel("parent").notNull(),
  url: text("url").notNull(),
  thumbPath: text("thumb_path"),
  thumbUrl: text("thumb_url"),
  aspectRatio: doublePrecision("aspect_ratio"),
  width: integer("width"),
  height: integer("height"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/// Relation
export const MediaRelation = relations(MediaModel, ({ one }) => ({
  creator: one(UserModel, {
    fields: [MediaModel.creatorId],
    references: [UserModel.id],
  }),
  club: one(ClubModel, {
    fields: [MediaModel.clubId],
    references: [ClubModel.id],
  }),
}));
