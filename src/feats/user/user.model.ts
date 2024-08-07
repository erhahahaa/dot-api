import {
  bigint,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { ClubModel } from "../club/club.model";

export const UserRoleEnumModel = pgEnum("user_role", ["coach", "athlete"]);
export const UserGenderEnumModel = pgEnum("user_gender", ["male", "female"]);

export const UserModel = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    username: text("username").notNull(),
    image: text("image")
      .default("https://api.dicebear.com/9.x/adventurer/png")
      .notNull(),
    password: text("password", {}).notNull(),
    phone: bigint("phone", { mode: "number" }).notNull(),
    gender: UserGenderEnumModel("gender"),
    role: UserRoleEnumModel("role").default("athlete").notNull(),
    bornPlace: text("born_place"),
    bornDate: timestamp("born_date"),
    religion: text("religion"),
    address: text("address"),
    expertise: text("expertise"),
    fcmToken: text("fcm_token"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (model) => {
    return {
      emailIdx: uniqueIndex("email_idx").on(model.email),
      usernameIdx: uniqueIndex("username_idx").on(model.username),
    };
  }
);

export const UserToClubModel = pgTable("users_to_clubs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => UserModel.id, {
      onDelete: "cascade",
    }),
  clubId: integer("club_id")
    .notNull()
    .references(() => ClubModel.id, {
      onDelete: "cascade",
    }),
  role: UserRoleEnumModel("role").default("athlete").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});
