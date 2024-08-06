import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static, t } from "elysia";
import { SelectMediaSchema } from "../media/media.schema";
import { ProgramModel } from "./program.model";

export const InsertProgramSchema = createInsertSchema(ProgramModel, {
  startDate: t.Union([t.String(), t.Date()]),
  endDate: t.Union([t.String(), t.Date()]),
});
export const SelectProgramSchema = createSelectSchema(ProgramModel, {
  startDate: t.Union([t.String(), t.Date()]),
  endDate: t.Union([t.String(), t.Date()]),
});

export type Program = Static<typeof SelectProgramSchema>;
export type InsertProgram = Static<typeof InsertProgramSchema>;

/// [Extras] Extended schema
export const SelectProgramExtendedSchema = t.Composite([
  SelectProgramSchema,
  t.Partial(
    t.Object({
      media: t.Union([SelectMediaSchema, t.Null()]),
    })
  ),
]);

export type ProgramExtended = Static<typeof SelectProgramExtendedSchema>;
