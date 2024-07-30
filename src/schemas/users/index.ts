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
import { examEvaluations } from "../clubs/exam/evaluation";
import { usersToClubs } from "./relations";

export const userRole = pgEnum("user_role", ["coach", "athlete"]);
export const userGender = pgEnum("user_gender", ["male", "female"]);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    username: text("username").notNull(),
    image: text("image")
      .default("https://api.dicebear.com/9.x/adventurer/png")
      .notNull(),
    password: text("password").notNull(),
    phone: text("phone"),
    gender: userGender("gender"),
    role: userRole("role").default("athlete").notNull(),
    bornPlace: text("born_place"),
    bornDate: timestamp("born_date"),
    religion: text("religion"),
    address: text("address"),
    expertise: text("expertise"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => {
    return {
      emailIdx: uniqueIndex("email_idx").on(t.email),
      usernameIdx: uniqueIndex("username_idx").on(t.username),
    };
  }
);
export const usersRelations = relations(users, ({ many }) => ({
  clubsPivot: many(usersToClubs),
  evaluations: many(examEvaluations),
}));

export const InsertUserSchema = createInsertSchema(users);
export const SelectUserSchema = createSelectSchema(users);
export type UserType = Static<typeof SelectUserSchema>;
