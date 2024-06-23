import { relations } from "drizzle-orm";
import { pgEnum, pgTable, primaryKey, serial } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static } from "elysia";
import { users } from ".";
import { programs } from "../programs";

export const userProgramRole = pgEnum("userProgramRole", ["coach", "athlete"]);

export const usersToPrograms = pgTable(
  "users_to_programs",
  {
    userId: serial("user_id")
      .notNull()
      .references(() => users.id),
    programId: serial("program_id")
      .notNull()
      .references(() => programs.id),
    role: userProgramRole("role").default("athlete").notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.programId] }),
  })
);
export const usersToProgramsRelations = relations(
  usersToPrograms,
  ({ one }) => ({
    program: one(programs, {
      fields: [usersToPrograms.programId],
      references: [programs.id],
    }),
    user: one(users, {
      fields: [usersToPrograms.userId],
      references: [users.id],
    }),
  })
);

export const InsertUserToProgramSchema = createInsertSchema(usersToPrograms);
export const SelectUserToProgramSchema = createSelectSchema(usersToPrograms);
export type UserToProgramType = Static<typeof SelectUserToProgramSchema>;
