import { t } from "elysia";
import { db } from "~/lib";
import {
  LiveTacticalSchema,
  LiveTacticalSchemaType,
  WebSocketMessageEvent,
} from "~/types/live-tactical";
import { run, ServerType } from "../..";

export function createLiveTacticalRouter(app: ServerType) {
  app.ws("/tactical/:id", {
    async open(ws) {
      const {
        data: { jwt, bearer, params },
      } = ws;
      const verify = (await jwt.verify(bearer)) as any;
      const find = await db.query.tacticals.findFirst({
        where(fields, { eq }) {
          return eq(fields.id, params.id);
        },
      });
      if (!verify || !find || !find.clubId) {
        ws.close();
        return;
      }
      const channel = `club:${find.clubId}:tactical:${params.id}`;
      ws.subscribe(channel);
      console.log(verify.name + " joined the room : " + find.name);
      const msg: LiveTacticalSchemaType = {
        event: WebSocketMessageEvent.join,
        params: {
          clubId: find.clubId,
          channel: channel,
          user: verify,
        },
        data: {},
      };
      ws.publish(channel, msg);
    },

    async message(ws, message) {
      try {
        console.log("MESSAGE", message);
        const {
          data: { jwt, bearer },
        } = ws;
        const verify = (await jwt.verify(bearer)) as any;
        if (!verify) {
          ws.close();
          return;
        }
        ws.publish(message.params.channel, message);
      } catch (error) {
        console.error("ERROR", error);
      }
    },
    async close(ws, code, message) {
      const {
        data: { jwt, bearer, params },
      } = ws;
      const verify = (await jwt.verify(bearer)) as any;
      const find = await db.query.tacticals.findFirst({
        where(fields, { eq }) {
          return eq(fields.id, params.id);
        },
      });
      if (!verify || !find || !find.clubId) {
        ws.close();
        return;
      }
      const channel = `club:${find.clubId}:tactical:${params.id}`;
      const msg: LiveTacticalSchemaType = {
        event: WebSocketMessageEvent.leave,
        params: {
          clubId: find.clubId,
          channel: channel,
          user: verify,
        },
        data: {},
      };
      run.server?.publish(channel, JSON.stringify(msg));

      ws.unsubscribe("club:1:tactical:73");
    },
    body: LiveTacticalSchema,
    params: t.Object({
      id: t.Number(),
    }),
    // message(ws, { type, params, data }) {
    //   switch (type) {
    //     case WebSocketMessageType.create:
    //       const roomId = createRoom(params);
    //       ws.send({
    //         type: WebSocketMessageType.create,
    //         params: {
    //           clubId: params.clubId,
    //           sessionName: params.sessionName,
    //           roomId,
    //         },
    //         data: {},
    //       });
    //       break;

    //     case WebSocketMessageType.join:
    //       const joinId = joinRoom(params);
    //       ws.send({
    //         type: WebSocketMessageType.join,
    //         params: {
    //           clubId: params.clubId,
    //           sessionName: params.sessionName,
    //           roomId: joinId,
    //           userId: params.userId,
    //         },
    //         data: {},
    //       });
    //       break;

    //     case WebSocketMessageType.leave:
    //       leaveRoom(params);
    //       ws.send({
    //         type: WebSocketMessageType.leave,
    //         params: {
    //           clubId: params.clubId,
    //           sessionName: params.sessionName,
    //           roomId: params.roomId,
    //           userId: params.userId,
    //         },
    //         data: {},
    //       });
    //       break;

    //     case WebSocketMessageType.destroy:
    //       destroyRoom(params);
    //       ws.send({
    //         type: WebSocketMessageType.destroy,
    //         params: {
    //           clubId: params.clubId,
    //           sessionName: params.sessionName,
    //           roomId: params.roomId,
    //         },
    //         data: {},
    //       });
    //       break;

    //     default:
    //       console.error("Unknown WebSocket message type:", type);
    //       ws.send({
    //         type: "error",
    //         message: "Unknown message type",
    //       });
    //       break;
    //   }
    // },
  });

  return app;
}

const rooms: Record<any, any> = {};

// function generateRoomId() {
//   return Math.random().toString(36).substring(2, 10);
// }

// function createRoom(params: LiveTacticalParamsType) {
//   const roomId = generateRoomId();
//   rooms[roomId] = {
//     clubId: params.clubId,
//     sessionName: params.sessionName,
//     participants: [],
//   };
//   return roomId;
// }

// function joinRoom(params: LiveTacticalParamsType) {
//   const { roomId, userId } = params;
//   if (!roomId) {
//     throw new Error("Room id undefined");
//   }
//   if (rooms[roomId]) {
//     rooms[roomId].participants.push(userId);
//   } else {
//     console.error(`Room ${roomId} does not exist`);
//   }
//   return roomId;
// }

// function leaveRoom(params: LiveTacticalParamsType) {
//   const { roomId, userId } = params;
//   if (!roomId) {
//     throw new Error("Room id undefined");
//   }
//   if (rooms[roomId]) {
//     rooms[roomId].participants = rooms[roomId].participants.filter(
//       (id: any) => id !== userId
//     );
//   } else {
//     console.error(`Room ${roomId} does not exist`);
//   }
// }

// function destroyRoom(params: LiveTacticalParamsType) {
//   const { roomId } = params;
//   if (!roomId) {
//     throw new Error("Room id undefined");
//   }
//   if (rooms[roomId]) {
//     delete rooms[roomId];
//   } else {
//     console.error(`Room ${roomId} does not exist`);
//   }
// }

// function getRoomParticipants(rooms: any, roomId: string) {
//   return rooms[roomId] ? rooms[roomId].participants : [];
// }
