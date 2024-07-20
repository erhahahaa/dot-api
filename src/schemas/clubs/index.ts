import { Type } from "@sinclair/typebox";
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
import { medias } from "../media";
import { users } from "../users";
import { usersToClubs } from "../users/relations";
import { programs } from "./programs";

export const sportType = pgEnum("sport_type", [
  "volleyBall",
  "basketBall",
  "soccer",
]);

export const clubs = pgTable("clubs", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => users.id, {
    onDelete: "set null",
  }),
  imageId: integer("image_id").references(() => medias.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: sportType("type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
export const clubsRelations = relations(clubs, ({ many, one }) => ({
  membersPivot: many(usersToClubs),
  creator: one(users, {
    fields: [clubs.creatorId],
    references: [users.id],
  }),
  image: one(medias, {
    fields: [clubs.imageId],
    references: [medias.id],
  }),
  programs: many(programs),
}));

export const InsertClubSchema = createInsertSchema(clubs, {
  imageId: Type.Optional(Type.Number()),
  creatorId: Type.Optional(Type.Union([Type.Number(), Type.String()])),
});
export const SelectClubSchema = createSelectSchema(clubs);
export type ClubType = Static<typeof SelectClubSchema>;
