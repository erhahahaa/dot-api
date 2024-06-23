import { t } from "elysia";
import {
  type LiveTacticalParamsType,
  WebSocketMessageType,
} from "~/types/live-tactical";
import { ServerType } from "../..";

export function createLiveTacticalRouter(app: ServerType) {
  app.ws("/tactical", {
    body: t.Object({
      type: t.Enum(WebSocketMessageType),
      params: t.Object({
        programId: t.String(),
        sessionName: t.String(),
        roomId: t.Optional(t.String()),
        userId: t.String(),
      }),
      data: t.Union([t.Object({}), t.Array(t.Object({}))]),
    }),
    message(ws, { type, params, data }) {
      switch (type) {
        case WebSocketMessageType.create:
          const roomId = createRoom(params);
          ws.send({
            type: WebSocketMessageType.create,
            params: {
              programId: params.programId,
              sessionName: params.sessionName,
              roomId,
            },
            data: {},
          });
          break;

        case WebSocketMessageType.join:
          const joinId = joinRoom(params);
          ws.send({
            type: WebSocketMessageType.join,
            params: {
              programId: params.programId,
              sessionName: params.sessionName,
              roomId: joinId,
              userId: params.userId,
            },
            data: {},
          });
          break;

        case WebSocketMessageType.leave:
          leaveRoom(params);
          ws.send({
            type: WebSocketMessageType.leave,
            params: {
              programId: params.programId,
              sessionName: params.sessionName,
              roomId: params.roomId,
              userId: params.userId,
            },
            data: {},
          });
          break;

        case WebSocketMessageType.destroy:
          destroyRoom(params);
          ws.send({
            type: WebSocketMessageType.destroy,
            params: {
              programId: params.programId,
              sessionName: params.sessionName,
              roomId: params.roomId,
            },
            data: {},
          });
          break;

        default:
          console.error("Unknown WebSocket message type:", type);
          ws.send({
            type: "error",
            message: "Unknown message type",
          });
          break;
      }
    },
  });

  return app;
}

const rooms: Record<any, any> = {};

function generateRoomId() {
  return Math.random().toString(36).substring(2, 10);
}

function createRoom(params: LiveTacticalParamsType) {
  const roomId = generateRoomId();
  rooms[roomId] = {
    programId: params.programId,
    sessionName: params.sessionName,
    participants: [],
  };
  return roomId;
}

function joinRoom(params: LiveTacticalParamsType) {
  const { roomId, userId } = params;
  if (!roomId) {
    throw new Error("Room id undefined");
  }
  if (rooms[roomId]) {
    rooms[roomId].participants.push(userId);
  } else {
    console.error(`Room ${roomId} does not exist`);
  }
  return roomId;
}

function leaveRoom(params: LiveTacticalParamsType) {
  const { roomId, userId } = params;
  if (!roomId) {
    throw new Error("Room id undefined");
  }
  if (rooms[roomId]) {
    rooms[roomId].participants = rooms[roomId].participants.filter(
      (id: any) => id !== userId
    );
  } else {
    console.error(`Room ${roomId} does not exist`);
  }
}

function destroyRoom(params: LiveTacticalParamsType) {
  const { roomId } = params;
  if (!roomId) {
    throw new Error("Room id undefined");
  }
  if (rooms[roomId]) {
    delete rooms[roomId];
  } else {
    console.error(`Room ${roomId} does not exist`);
  }
}

function getRoomParticipants(rooms: any, roomId: string) {
  return rooms[roomId] ? rooms[roomId].participants : [];
}
