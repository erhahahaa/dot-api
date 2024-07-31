import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static } from "elysia";
import { clubs } from "../clubs";
import { users } from "../users";

export const mediaType = pgEnum("media_type", [
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

export const mediaParent = pgEnum("media_parent", [
  "club",
  "program",
  "exercise",
  "exam",
  "question",
  "user",
]);

export const medias = pgTable("medias", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => users.id, {
    onDelete: "set null",
  }),
  clubId: integer("club_id").references(() => clubs.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  description: text("description"),
  fileSize: integer("file_size"),
  path: text("path"),
  type: mediaType("type").notNull(),
  parent: mediaParent("parent").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const mediasRelations = relations(medias, ({ one }) => ({
  creator: one(users, {
    fields: [medias.creatorId],
    references: [users.id],
  }),
  club: one(clubs, {
    fields: [medias.clubId],
    references: [clubs.id],
  }),
}));

export const InsertMediaSchema = createInsertSchema(medias);
export const SelectMediaSchema = createSelectSchema(medias);
export type MediaType = Static<typeof SelectMediaSchema>;
export type ParentType = Static<typeof InsertMediaSchema.properties.parent>;
