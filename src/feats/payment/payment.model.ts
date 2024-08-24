import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { ClubModel } from "../club/club.model";
import { UserModel } from "../user/user.model";

export const PaymentModel = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => UserModel.id, {
    onDelete: "set null",
  }),
  clubId: integer("club_id").references(() => ClubModel.id, {
    onDelete: "set null",
  }),
  amount: integer("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
