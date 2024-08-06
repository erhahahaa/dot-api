import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static, t, TSchema } from "elysia";
import { SelectMediaSchema } from "../media/media.schema";
import { TacticalModel } from "./tactical.model";

export const TacticalStrategicSchema = t.Object({
  players: t.Optional(
    t.Array(
      t.Object({
        x: t.Number(),
        y: t.Number(),
        number: t.Number(),
        team: t.Number(),
        hexColor: t.Number(),
      })
    )
  ),
  arrows: t.Optional(
    t.Array(
      t.Object({
        startX: t.Number(),
        startY: t.Number(),
        endX: t.Number(),
        endY: t.Number(),
      })
    )
  ),
});
export const TacticalBoardSchema = t.Object({
  width: t.Number(),
  height: t.Number(),
});
export type TacticalBoard = Static<typeof TacticalBoardSchema>;
export type TacticalStrategic = Static<typeof TacticalStrategicSchema>;

export const InsertTacticalSchema = createInsertSchema(TacticalModel, {
  board: t.Optional(TacticalBoardSchema),
  strategic: t.Optional(TacticalStrategicSchema),
});
export const SelectTacticalSchema = createSelectSchema(TacticalModel, {
  board: t.Optional(TacticalBoardSchema),
  strategic: t.Optional(TacticalStrategicSchema),
});

export type Tactical = Static<typeof SelectTacticalSchema>;
export type InsertTactical = Static<typeof InsertTacticalSchema>;

/// [Extras] Extended schema
export const SelectTacticalExtendedSchema = t.Composite([
  SelectTacticalSchema,
  t.Partial(
    t.Object({
      media: t.Union([SelectMediaSchema, t.Null()]),
    })
  ),
]);

export type TacticalExtended = Static<typeof SelectTacticalExtendedSchema>;

export enum WebSocketMessageEvent {
  destroy = "destroy",
  join = "join",
  leave = "leave",
  message = "message",
}
export const LiveTacticalParams = t.Object({
  clubId: t.Number(),
  channel: t.String(),
  user: t.Any(),
});

export const LiveTacticalSchema = <T extends TSchema>(T: T) =>
  t.Object({
    event: t.Enum(WebSocketMessageEvent),
    params: LiveTacticalParams,
    data: t.Optional(T),
  });

export type LiveTacticalSchemaReturnType<T extends TSchema> = ReturnType<
  typeof LiveTacticalSchema<T>
>;
export type LiveTacticalSchemaType<T extends TSchema> = Static<
  LiveTacticalSchemaReturnType<T>
>;
export type LiveTacticalParamsType = Static<typeof LiveTacticalParams>;
