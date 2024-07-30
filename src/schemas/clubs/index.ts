import { Type } from "@sinclair/typebox";
import { relations } from "drizzle-orm";
import {
  AnyPgColumn,
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
import { exams } from "./exam";
import { examEvaluations } from "./exam/evaluation";
import { programs } from "./programs";
import { tacticals } from "./tacticals";

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
  mediaId: integer("media_id").references((): AnyPgColumn => medias.id, {
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
  programs: many(programs),
  exams: many(exams),
  tacticals: many(tacticals),
  creator: one(users, {
    fields: [clubs.creatorId],
    references: [users.id],
  }),
  media: one(medias, {
    fields: [clubs.mediaId],
    references: [medias.id],
  }),
  evaluations: many(examEvaluations),
}));

export const InsertClubSchema = createInsertSchema(clubs, {
  creatorId: Type.Optional(Type.Union([Type.Number(), Type.String()])),
});
export const SelectClubSchema = createSelectSchema(clubs);
export type ClubType = Static<typeof SelectClubSchema>;
