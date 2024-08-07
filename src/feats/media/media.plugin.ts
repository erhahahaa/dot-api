import Elysia, { t } from "elysia";
import { APIResponseSchema } from "../../core/response";
import { BucketService } from "../../core/services/bucket";
import { CacheService } from "../../core/services/cache";
import { AuthService } from "../auth/auth.service";
import { Dependency } from "./media.dependency";
import {
  InsertMediaSchema,
  Media,
  MediaType,
  SelectMediaSchema,
} from "./media.schema";

export const MediaPlugin = new Elysia()
  .use(Dependency)
  .use(AuthService)
  .use(BucketService)
  .use(CacheService(100, 60 * 60 * 1000)) // 100 items, 1 hour
  .get(
    "/:dir",
    async ({ mediaRepo, query: { clubId }, params: { dir }, cache }) => {
      const cached = cache.get<Media[]>(`medias_${clubId}_${dir}`);
      if (cached) {
        return {
          message: "Media list",
          data: cached,
        };
      }

      const medias = await mediaRepo.list({ clubId: clubId, parent: dir });
      cache.set(`medias_${clubId}_${dir}`, medias);

      return {
        message: "Media list",
        data: medias,
      };
    },
    {
      detail: {
        tags: ["MEDIA"],
      },
      query: t.Object({
        clubId: t.Number(),
      }),
      params: t.Object({
        dir: InsertMediaSchema.properties.parent,
      }),

      response: APIResponseSchema(t.Array(SelectMediaSchema)),
    }
  )
  .post(
    "/:dir",
    async ({
      mediaRepo,
      clubRepo,
      body,
      verifyJWT,
      params: { dir },
      query: { clubId },
      uploadFile,
    }) => {
      const user = await verifyJWT();

      const findClub = await clubRepo.find(clubId);

      const upload = await uploadFile({
        parent: dir,
        blob: body.file,
      });

      const media = await mediaRepo.create({
        creatorId: user.id,
        clubId: findClub.id,
        name: body.file.name,
        fileSize: body.file.size,
        path: upload.name,
        type: body.file.type as MediaType,
        parent: dir,
        url: upload.url,
      });

      return {
        message: "Media uploaded",
        data: media,
      };
    },
    {
      detail: {
        tags: ["MEDIA"],
      },
      query: t.Object({
        clubId: t.Number(),
      }),
      params: t.Object({
        dir: InsertMediaSchema.properties.parent,
      }),
      body: t.Object({
        file: t.File(),
      }),
      response: APIResponseSchema(SelectMediaSchema),
      afterHandle: async ({
        mediaRepo,
        cache,
        query: { clubId },
        params: { dir },
      }) => {
        cache.delete(`medias_${clubId}_${dir}`);
        const medias = await mediaRepo.list({ clubId, parent: dir });
        cache.set(`medias_${clubId}_${dir}`, medias);
      },
    }
  )
  .put(
    "/:dir/:id",
    async ({
      mediaRepo,
      params: { id, dir },
      body,
      uploadFile,
      deleteFile,
    }) => {
      const { path } = await mediaRepo.find(id);

      if (path) {
        await mediaRepo.delete(id);
        await deleteFile({ parent: dir, path });
      }

      const upload = await uploadFile({
        parent: dir,
        blob: body.file,
      });

      const media = await mediaRepo.update({
        ...body,
        id: id,
        parent: dir,
        path: upload.name,
        name: body.file.name,
        type: body.file.type as MediaType,
        url: upload.url,
      });

      return {
        message: "Media updated",
        data: media,
      };
    },
    {
      detail: {
        tags: ["MEDIA"],
      },
      params: t.Object({
        id: t.Number(),
        dir: InsertMediaSchema.properties.parent,
      }),
      body: t.Object({
        file: t.File(),
      }),
      response: APIResponseSchema(SelectMediaSchema),
      afterHandle: async ({ mediaRepo, cache, params: { dir, id } }) => {
        const { clubId } = await mediaRepo.find(id);
        if (clubId) {
          cache.delete(`medias_${clubId}_${dir}`);
          const medias = await mediaRepo.list({ clubId, parent: dir });
          cache.set(`medias_${clubId}_${dir}`, medias);
        }
      },
    }
  );
