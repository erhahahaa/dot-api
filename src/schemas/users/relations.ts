import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static } from "elysia";
import { users } from ".";
import { clubs } from "../clubs";

export const userRole = pgEnum("user_role", ["coach", "athlete"]);

export const usersToClubs = pgTable("users_to_clubs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
  clubId: integer("club_id")
    .notNull()
    .references(() => clubs.id, {
      onDelete: "cascade",
    }),
  role: userRole("role").default("athlete").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const usersToClubsRelations = relations(usersToClubs, ({ one }) => ({
  club: one(clubs, {
    fields: [usersToClubs.clubId],
    references: [clubs.id],
  }),
  user: one(users, {
    fields: [usersToClubs.userId],
    references: [users.id],
  }),
}));

export const InsertUserToClubSchema = createInsertSchema(usersToClubs);
export const SelectUserToClubSchema = createSelectSchema(usersToClubs);
export type UserToClubType = Static<typeof SelectUserToClubSchema>;
