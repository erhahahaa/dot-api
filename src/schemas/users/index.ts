import { relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static } from "elysia";
import { usersToClubs } from "./relations";

export const userRole = pgEnum("user_role", ["coach", "athlete"]);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    image: text("image")
      .default("https://api.dicebear.com/9.x/adventurer/png")
      .notNull(),
    password: text("password").notNull(),
    phone: text("phone"),
    role: userRole("role").default("athlete").notNull(),
    expertise: text("expertise"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => {
    return {
      emailIdx: uniqueIndex("email_idx").on(t.email),
    };
  }
);
export const usersRelations = relations(users, ({ many }) => ({
  clubsPivot: many(usersToClubs),
}));

export const InsertUserSchema = createInsertSchema(users);
export const SelectUserSchema = createSelectSchema(users);
export type UserType = Static<typeof SelectUserSchema>;
