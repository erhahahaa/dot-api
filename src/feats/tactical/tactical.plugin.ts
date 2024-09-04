import Elysia, { t } from "elysia";
import { Message } from "firebase-admin/messaging";
import { app } from "../..";
import { GlobalDependency } from "../../core/di";
import { BadRequestError } from "../../core/errors";
import { APIResponseSchema, TypeOfNullish } from "../../core/response";
import { BucketService } from "../../core/services/bucket";
import { DEFAULT_IMAGE, MessagingService } from "../../core/services/fb";
import { IdParam } from "../../utils/param";
import { AuthJWT } from "../auth/auth.schema";
import { AuthService } from "../auth/auth.service";
import {
  InsertTacticalSchema,
  LiveTacticalSchema,
  LiveTacticalSchemaType,
  SelectTacticalExtendedSchema,
  TacticalStrategicSchema,
  WebSocketMessageEvent,
} from "./tactical.schema";

export const TacticalPlugin = new Elysia({
  name: "Day of Training Tactical API",
  tags: ["TACTICAL"],
})
  .use(GlobalDependency)
  .use(AuthService)
  .use(BucketService)
  .use(MessagingService)
  .model("tactical.insert", InsertTacticalSchema)
  .model("tactical.response", APIResponseSchema(SelectTacticalExtendedSchema))
  .use(IdParam)
  .get(
    "/",
    async ({ tacticalRepo, query: { clubId }, verifyJWT }) => {
      const user = await verifyJWT();

      const tacticals = await tacticalRepo.list({ clubId, userId: user.id });
      return {
        message: "Found tacticals",
        data: tacticals,
      };
    },
    {
      query: t.Object({ clubId: t.Optional(t.Number()) }),
      response: {
        200: APIResponseSchema(t.Array(SelectTacticalExtendedSchema)),
      },
    }
  )
  .post(
    "/",
    async ({ tacticalRepo, body, verifyJWT }) => {
      const user = await verifyJWT();

      const host = body.isLive ? user.name : null;

      const tactical = await tacticalRepo.create({
        ...body,
        host,
      });

      return {
        message: "Tactical created",
        data: tactical,
      };
    },
    {
      body: "tactical.insert",
      response: { 200: "tactical.response" },
      afterHandle: async ({ clubRepo, verifyJWT, response, messenger }) => {
        const res = response[200].data;
        if (!response || !res) return;
        const { id, clubId, name } = res;
        if (!clubId) return;
        const { name: clubName } = await clubRepo.find(clubId);
        const topic = `club_${clubId}`;

        const messageBody = `${name} tactical is now available in ${clubName} club !`;
        const title = "New tactical just dropped! 🎉";
        const data = {
          id: `club_${clubId}_tactical_${id}`,
          type: "TACTICAL",
          title,
          body: title,
        };

        const msg: Message = {
          notification: {
            title,
            body: messageBody,
            imageUrl: DEFAULT_IMAGE,
          },
          data,
          android: {
            notification: {
              title,
              body: messageBody,
              imageUrl: DEFAULT_IMAGE,
              sound: "default",
              priority: "high",
            },
            data,
          },
          topic,
        };

        await messenger.send(msg);
      },
    }
  )
  .get(
    "/:id",
    async ({ tacticalRepo, params: { id } }) => {
      const tactical = await tacticalRepo.find(id);

      return {
        message: "Tactical found",
        data: tactical,
      };
    },
    {
      params: "id.param",
      response: { 200: "tactical.response" },
    }
  )
  .put(
    "/:id",
    async ({ tacticalRepo, body, params: { id } }) => {
      const tactical = await tacticalRepo.update({
        ...body,
        id,
      });
      return {
        message: "Tactical updated",
        data: tactical,
      };
    },
    {
      params: "id.param",
      body: "tactical.insert",
      response: { 200: "tactical.response" },
    }
  )
  .delete(
    "/:id",
    async ({ tacticalRepo, params: { id } }) => {
      const data = await tacticalRepo.delete(id);
      return {
        message: "Tactical deleted",
        data,
      };
    },
    {
      params: "id.param",
      response: { 200: "tactical.response" },
    }
  );

const channel: Record<string, { user: AuthJWT; isHost: boolean }[]> = {};

export const TacticalWebSocketPlugin = new Elysia()
  .use(GlobalDependency)
  .use(AuthService)
  .model("id.param", t.Object({ id: t.Number() }))
  .ws("/tactical/:id", {
    async open({
      data: {
        tacticalRepo,
        verifyJWT,
        params: { id },
      },
      subscribe,
      publish,
      close,
    }) {
      try {
        const user = await verifyJWT();

        const { clubId } = await tacticalRepo.find(id);
        if (!clubId) {
          close();
          throw new BadRequestError("Tactical not found");
        }

        const channelName = `club:${clubId}:tactical:${id}`;

        if (!channel[channelName]) {
          channel[channelName] = [{ isHost: true, user }];
        } else {
          channel[channelName].push({ isHost: false, user });
        }

        subscribe(channelName);
        const msg: LiveTacticalSchemaType<TypeOfNullish> = {
          event: WebSocketMessageEvent.join,
          params: {
            clubId,
            channel: channelName,
            user,
          },
        };

        publish(channelName, msg);
      } catch (error) {
        console.error(error);
        close();
      }
    },
    async message({ publish }, message) {
      try {
        const {
          params: { channel },
        } = message as any;
        publish(channel, message as any);
      } catch (error) {
        console.error(error);
      }
    },
    async close({
      data: {
        tacticalRepo,
        verifyJWT,
        params: { id },
      },
      unsubscribe,
      close,
    }) {
      try {
        const user = await verifyJWT();

        const { clubId, name } = await tacticalRepo.find(id);
        if (!clubId) {
          close();
          throw new BadRequestError("Tactical not found");
        }

        await tacticalRepo.update({
          id,
          name,
          isLive: false,
          host: null,
        });

        const channelName = `club:${clubId}:tactical:${id}`;

        if (!channel[channelName]) {
          close();
          return;
        } else {
          channel[channelName] = channel[channelName].filter(
            (c: { user: AuthJWT }) => c.user.id !== user.id
          );

          if (channel[channelName].length === 0) {
            delete channel[channelName];
          } else if (channel[channelName][0].user.id === user.id) {
            const msg: LiveTacticalSchemaType<TypeOfNullish> = {
              event: WebSocketMessageEvent.destroy,
              params: {
                clubId,
                channel: channelName,
                user,
              },
            };
            app.server?.publish(channelName, JSON.stringify(msg));
            delete channel[channelName];
            await tacticalRepo.update({
              id,
              name,
              isLive: false,
              host: null,
            });
          } else {
            const msg: LiveTacticalSchemaType<TypeOfNullish> = {
              event: WebSocketMessageEvent.leave,
              params: {
                clubId,
                channel: channelName,
                user,
              },
            };
            app.server?.publish(channelName, JSON.stringify(msg));
          }
        }

        unsubscribe(channelName);
      } catch (error) {
        console.error(error);
        close();
      }
    },
    body: LiveTacticalSchema(
      t.Union([t.Null(), t.Undefined(), TacticalStrategicSchema])
    ),
    params: "id.param",
  });
