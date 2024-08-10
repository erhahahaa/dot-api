import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static, t } from "elysia";
import { SelectMediaSchema } from "../media/media.schema";
import { InsertUserSchema } from "../user/user.schema";
import { ClubModel } from "./club.model";

const _InsertClubSchema = createInsertSchema(ClubModel, {});
export const InsertClubSchema = t.Composite([
  _InsertClubSchema,
  t.Partial(
    t.Object({
      image: t.Optional(t.File()),
    })
  ),
]);

export const SelectClubSchema = createSelectSchema(ClubModel, {});

export type Club = Static<typeof SelectClubSchema>;
export type InsertClub = Static<typeof InsertClubSchema>;

/// [Extras] Extended schema
export const SelectClubExtendedSchema = t.Composite([
  SelectClubSchema,
  t.Partial(
    t.Object({
      media: t.Union([SelectMediaSchema, t.Null()]),
      memberCount: t.Number(),
      programCount: t.Number(),
      examCount: t.Number(),
      tacticalCount: t.Number(),
    })
  ),
]);
export const ClubMemberSchema = t.Union([
  t.Composite([
    t.Pick(InsertUserSchema, ["id", "name", "image", "role", "email"]),
    t.Object({
      age: t.Number(),
    }),
  ]),
  t.Null(),
]);

export type ClubExtended = Static<typeof SelectClubExtendedSchema>;
export type ClubMember = Static<typeof ClubMemberSchema>;
