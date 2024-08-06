import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static, t } from "elysia";
import { UserModel, UserToClubModel } from "./user.model";

export const InsertUserSchema = createInsertSchema(UserModel, {
  password: t.Union([t.String(), t.Null()]),
  phone: t.Number({ minimum: 100000000, maximum: 9999999999999 }),
  bornDate: t.Union([t.String(), t.Date()]),
});
export const SelectUserSchema = createSelectSchema(UserModel, {
  password: t.Never(),
  phone: t.Number({ minimum: 100000000, maximum: 9999999999999 }),
  bornDate: t.Union([t.String(), t.Date()]),
});
export const UpdateUserSchema = t.Partial(InsertUserSchema);

export const InsertUserToClubSchema = createInsertSchema(UserToClubModel, {});
export const SelectUserToClubSchema = createSelectSchema(UserToClubModel, {});

export type User = Static<typeof SelectUserSchema>;
export type InsertUser = Static<typeof InsertUserSchema>;
export type UpdateUser = Static<typeof UpdateUserSchema>;
export type UserToClub = Static<typeof SelectUserToClubSchema>;
