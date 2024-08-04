import { Static, t } from "elysia";
import { StrategicSchema } from "~/schemas/clubs/tacticals";
export enum WebSocketMessageEvent {
  join = "join",
  leave = "leave",
  message = "message",
}
export const LiveTacticalParams = t.Object({
  clubId: t.Number(),
  channel: t.String(),
  user: t.Any(),
});

export type LiveTacticalParamsType = Static<typeof LiveTacticalParams>;

export const LiveTacticalSchema = t.Object({
  event: t.Enum(WebSocketMessageEvent),
  params: LiveTacticalParams,
  data: t.Union([t.Any(), StrategicSchema]),
});

export type LiveTacticalSchemaType = Static<typeof LiveTacticalSchema>;
