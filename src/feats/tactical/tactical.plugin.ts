import Elysia, { t } from "elysia";
import { app } from "../..";
import { BadRequestError } from "../../core/errors";
import { APIResponseSchema, TypeOfNullish } from "../../core/response";
import { BucketService } from "../../core/services/bucket";
import { CacheService } from "../../core/services/cache";
import { AuthJWT } from "../auth/auth.schema";
import { AuthService } from "../auth/auth.service";
import { Dependency } from "./tactical.dependency";
import {
  InsertTacticalSchema,
  LiveTacticalSchema,
  LiveTacticalSchemaType,
  SelectTacticalExtendedSchema,
  Tactical,
  TacticalStrategicSchema,
  WebSocketMessageEvent,
} from "./tactical.schema";

export const TacticalPlugin = new Elysia()
  .use(Dependency)
  .use(AuthService)
  .use(BucketService)
  .use(CacheService(100, 60 * 60 * 1000)) // 100 items, 1 hour
  .get(
    "/",
    async ({ tacticalRepo, query: { clubId }, verifyJWT, cache }) => {
      const user = await verifyJWT();
      let cached = undefined;
      if (clubId) {
        cached = cache.get<Tactical[]>(`tacticals_${clubId}`);
      } else {
        cached = cache.get<Tactical[]>(`tacticals_${clubId}_${user.id}`);
      }
      if (cached) {
        return {
          message: "Found tacticals",
          data: cached,
        };
      }

      const tacticals = await tacticalRepo.list({ clubId, userId: user.id });
      cache.set(`tacticals_${clubId}_${user.id}`, tacticals);

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
      afterHandle: async ({ tacticalRepo, cache, body, verifyJWT }) => {
        const user = await verifyJWT();
        const { clubId } = body;
        if (clubId) {
          cache.delete(`tacticals_${clubId}_${user.id}`);
          const tacticals = await tacticalRepo.list({
            clubId,
            userId: user.id,
          });
          cache.set(`tacticals_${clubId}_${user.id}`, tacticals);
        } else {
          cache.delete(`tacticals_${clubId}`);
          const tacticals = await tacticalRepo.list({
            clubId,
            userId: user.id,
          });
          cache.set(`tacticals_${clubId}`, tacticals);
        }
      },
    }
  )
  .get(
    "/:id",
    async ({ tacticalRepo, params: { id }, cache }) => {
      const cached = cache.get<Tactical>(`tactical_${id}`);
      if (cached) {
        return {
          message: "Tactical found",
          data: cached,
        };
      }

      const tactical = await tacticalRepo.find(id);
      cache.set(`tactical_${id}`, tactical);

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
      afterHandle: async ({
        tacticalRepo,
        cache,
        params: { id },
        verifyJWT,
      }) => {
        const user = await verifyJWT();
        cache.delete(`tactical_${id}`);
        const tactical = await tacticalRepo.find(id);
        cache.set(`tactical_${id}`, tactical);

        const { clubId } = tactical;
        if (clubId) {
          cache.delete(`tacticals_${clubId}`);
          const tacticals = await tacticalRepo.list({ clubId });
          cache.set(`tacticals_${clubId}`, tacticals);
          cache.delete(`tacticals_${clubId}_${user.id}`);
          const tacticalsUser = await tacticalRepo.list({
            clubId,
            userId: user.id,
          });
          cache.set(`tacticals_${clubId}_${user.id}`, tacticalsUser);
        }
      },
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
      afterHandle: async ({
        tacticalRepo,
        cache,
        params: { id },
        verifyJWT,
      }) => {
        const user = await verifyJWT();

        cache.delete(`tactical_${id}`);
        const tactical = await tacticalRepo.find(id);
        cache.set(`tactical_${id}`, tactical);

        const { clubId } = tactical;
        if (clubId) {
          cache.delete(`tacticals_${clubId}`);
          const tacticals = await tacticalRepo.list({ clubId });
          cache.set(`tacticals_${clubId}`, tacticals);
          cache.delete(`tacticals_${clubId}_${user.id}`);
          const tacticalsUser = await tacticalRepo.list({
            clubId,
            userId: user.id,
          });
          cache.set(`tacticals_${clubId}_${user.id}`, tacticalsUser);
        }
      },
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
