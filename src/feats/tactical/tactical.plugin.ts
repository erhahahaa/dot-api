import Elysia, { t } from "elysia";
import { app } from "../..";
import { BadRequestError } from "../../core/errors";
import { APIResponseSchema, TypeOfNullish } from "../../core/response";
import { BucketService } from "../../core/services/bucket";
import { AuthJWT } from "../auth/auth.schema";
import { AuthService } from "../auth/auth.service";
import { Dependency } from "./tactical.dependency";
import {
  InsertTacticalSchema,
  LiveTacticalSchema,
  LiveTacticalSchemaType,
  SelectTacticalExtendedSchema,
  TacticalStrategicSchema,
  WebSocketMessageEvent,
} from "./tactical.schema";

export const TacticalPlugin = new Elysia()
  .use(Dependency)
  .use(AuthService)
  .use(BucketService)
  .get(
    "/",
    async ({ tacticalRepo, query: { clubId }, verifyJWT }) => {
      const user = await verifyJWT();
      console.log("clubId", clubId);
      console.log("user", user);
      const tacticals = await tacticalRepo.list({ clubId, userId: user.id });

      return {
        message: "Found tacticals",
        data: tacticals,
      };
    },
    {
      detail: {
        tags: ["TACTICAL"],
      },
      query: t.Object({
        clubId: t.Optional(t.Number()),
      }),
      response: APIResponseSchema(t.Array(SelectTacticalExtendedSchema)),
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
      detail: {
        tags: ["TACTICAL"],
      },
      body: InsertTacticalSchema,
      response: APIResponseSchema(SelectTacticalExtendedSchema),
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
      detail: {
        tags: ["TACTICAL"],
      },
      params: t.Object({
        id: t.Number(),
      }),
      response: APIResponseSchema(SelectTacticalExtendedSchema),
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
      detail: {
        tags: ["TACTICAL"],
      },
      params: t.Object({
        id: t.Number(),
      }),
      body: InsertTacticalSchema,
      response: APIResponseSchema(SelectTacticalExtendedSchema),
    }
  )
  .delete(
    "/:id",
    async ({ tacticalRepo, params: { id } }) => {
      await tacticalRepo.delete(id);
      return {
        message: "Tactical deleted",
      };
    },
    {
      detail: {
        tags: ["TACTICAL"],
      },
      params: t.Object({
        id: t.Number(),
      }),
      response: APIResponseSchema(SelectTacticalExtendedSchema),
    }
  );

const channel: Record<string, { user: AuthJWT; isHost: boolean }[]> = {};

export const TacticalWebSocketPlugin = new Elysia()
  .use(Dependency)
  .use(AuthService)
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
    async message({ data: { verifyJWT }, publish }, message) {
      try {
        await verifyJWT();

        const {
          params: { channel },
        } = message;
        publish(channel, message);
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
    params: t.Object({
      id: t.Number(),
    }),
  });
