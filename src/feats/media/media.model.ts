import {
  integer,
  pgEnum,
  pgTable,
  real,
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
  "image/gif",
  "image/svg+xml",
  // DOCUMENT
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-word", // shortened DOCX
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-excel", // shortened XLSX
  "text/plain",
  // VIDEO
  "video/mp4",
  "video/avi",
  "video/mpeg",
  "video/quicktime",
  // AUDIO
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  // ARCHIVE
  "application/zip",
  "application/x-rar-compressed",
  // GENERIC BINARY
  "application/octet-stream",
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
  aspectRatio: real("aspect_ratio"),
  width: integer("width"),
  height: integer("height"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
