import { relations } from "drizzle-orm";
import { pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static } from "elysia";
import { usersToPrograms } from "./relations";
export const userRole = pgEnum("role", ["superadmin", "admin", "user"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey().notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  image: text("image")
    .default("https://api.dicebear.com/9.x/adventurer/png")
    .notNull(),
  password: text("password").notNull(),
  phone: text("phone"),
  role: userRole("role").default("user").notNull(),
  expertise: text("expertise").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});
export const usersRelations = relations(users, ({ many }) => ({
  usersToPrograms: many(usersToPrograms),
}));

export const InsertUserSchema = createInsertSchema(users);
export const SelectUserSchema = createSelectSchema(users);
export type UserType = Static<typeof SelectUserSchema>;
