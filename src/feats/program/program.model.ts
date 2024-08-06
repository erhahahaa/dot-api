import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { ClubModel } from "../club/club.model";
import { MediaModel } from "../media/media.model";

export const ProgramModel = pgTable("programs", {
  id: serial("id").primaryKey(),
  clubId: integer("club_id").references(() => ClubModel.id, {
    onDelete: "cascade",
  }),
  mediaId: integer("media_id").references(() => MediaModel.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
