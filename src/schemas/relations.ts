import { relations } from "drizzle-orm";
import { pgTable, primaryKey, serial } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static } from "elysia";
import { programs } from "./programs";
import { users } from "./users";

export const usersToPrograms = pgTable(
  "users_to_programs",
  {
    userId: serial("user_id")
      .notNull()
      .references(() => users.id),
    programId: serial("program_id")
      .notNull()
      .references(() => programs.id),
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
