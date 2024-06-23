import { relations } from "drizzle-orm";
import {
  foreignKey,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static } from "elysia";
import { users } from "../users";
import { usersToPrograms } from "../users/relations";

export const programs = pgTable(
  "programs",
  {
    id: serial("id").primaryKey().notNull(),
    creator_id: serial("creator_id").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    image: text("image")
      .notNull()
      .default(
        "https://img.freepik.com/free-photo/sports-tools_53876-138077.jpg"
      ),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    creatorReference: foreignKey({
      columns: [t.creator_id],
      foreignColumns: [users.id],
    }),
  })
);
export const programsRelations = relations(programs, ({ many }) => ({
  programsToUsers: many(usersToPrograms),
}));

export const InsertProgramSchema = createInsertSchema(programs);
export const SelectProgramSchema = createSelectSchema(programs);
export type ProgramType = Static<typeof SelectProgramSchema>;
