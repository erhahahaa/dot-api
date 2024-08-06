import {
  AnyPgColumn,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { MediaModel } from "../media/media.model";
import { UserModel } from "../user/user.model";

export const SportTypeEnumModel = pgEnum("sport_type", [
  "volleyBall",
  "basketBall",
  "soccer",
]);

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
  type: SportTypeEnumModel("type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
