import { relations } from "drizzle-orm";
import {
  foreignKey,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static } from "elysia";
import { users } from "../users";
import { usersToClubs } from "../users/relations";

export const sportType = pgEnum("sport_type", [
  "volleyBall",
  "basketBall",
  "soccer",
]);

export const clubs = pgTable(
  "clubs",
  {
    id: serial("id").primaryKey().notNull(),
    creatorId: serial("creator_id").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    type: sportType("type").notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    creatorReference: foreignKey({
      columns: [t.creatorId],
      foreignColumns: [users.id],
    }),
  })
);
export const clubsRelations = relations(clubs, ({ many }) => ({
  clubsToUsers: many(usersToClubs),
}));

export const InsertClubSchema = createInsertSchema(clubs);
export const SelectClubSchema = createSelectSchema(clubs);
export type ClubType = Static<typeof SelectClubSchema>;
