import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static } from "elysia";
import { MediaModel } from "./media.model";

export const InsertMediaSchema = createInsertSchema(MediaModel, {});
export const SelectMediaSchema = createSelectSchema(MediaModel, {});

export type Media = Static<typeof SelectMediaSchema>;
export type InsertMedia = Static<typeof InsertMediaSchema>;
export type MediaParent = Static<typeof SelectMediaSchema.properties.parent>;
export type MediaType = Static<typeof SelectMediaSchema.properties.type>;
