import { Static, t } from "elysia";
export enum WebSocketMessageType {
  all = "all",
  create = "create",
  join = "join",
  leave = "leave",
  destroy = "destroy",
}
export const LiveTacticalParams = t.Object({
  programId: t.String(),
  sessionName: t.String(),
  roomId: t.Optional(t.String()),
  userId: t.String(),
});

export type LiveTacticalParamsType = Static<typeof LiveTacticalParams>;

export const LiveTacticalSchema = t.Object({
  type: t.Enum(WebSocketMessageType),
  params: LiveTacticalParams,
  data: t.Union([t.Object({}), t.Array(t.Object({}))]),
});

export type LiveTacticalSchemaType = Static<typeof LiveTacticalSchema>;
