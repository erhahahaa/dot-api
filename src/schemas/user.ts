import { sql } from "drizzle-orm";
import { date, pgEnum, pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static } from "elysia";

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
  role: userRole("role")
    .$default(() => "user")
    .notNull(),
  expertise: text("expertise").notNull(),
  created_at: date("created_at").default(sql`CURRENT_DATE`),
  updated_at: date("updated_at").default(sql`CURRENT_DATE`),
});

export const InsertUserSchema = createInsertSchema(users);
export type UserType = Static<typeof InsertUserSchema>;
export const SelectUserSchema = createSelectSchema(users);
