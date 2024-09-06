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
import { ExamModel } from "../exam/exam.model";
import { MediaModel } from "../media/media.model";
import { ProgramModel } from "../program/program.model";
import { TacticalModel } from "../tactical/tactical.model";
import { UserModel, UserToClubModel } from "../user/user.model";

// export const SportTypeEnumModel = pgEnum("sport_type", [
//   "volleyBall",
//   "basketBall",
//   "soccer",
// ]);
export const SportTypeModel = pgTable("sport_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const ClubModel = pgTable("clubs", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => UserModel.id, {
    onDelete: "set null",
  }),
  mediaId: integer("media_id").references((): AnyPgColumn => MediaModel.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/// Relation
export const ClubRelation = relations(ClubModel, ({ one, many }) => ({
  creator: one(UserModel, {
    fields: [ClubModel.creatorId],
    references: [UserModel.id],
  }),
  media: one(MediaModel, {
    fields: [ClubModel.mediaId],
    references: [MediaModel.id],
  }),
  members: many(UserToClubModel),
  programs: many(ProgramModel),
  exams: many(ExamModel),
  tacticals: many(TacticalModel),
}));
