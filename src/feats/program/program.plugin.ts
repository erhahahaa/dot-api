import Elysia, { t } from "elysia";
import { Message } from "firebase-admin/messaging";
import { APIResponseSchema } from "../../core/response";
import { BucketService } from "../../core/services/bucket";
import { CacheService } from "../../core/services/cache";
import { MessagingService } from "../../core/services/fb";
import { AuthService } from "../auth/auth.service";
import { MediaType } from "../media/media.schema";
import { Dependency } from "./program.dependency";
import {
  InsertProgramSchema,
  ProgramExtended,
  SelectProgramExtendedSchema,
} from "./program.schema";

export const ProgramPlugin = new Elysia()
  .use(Dependency)
  .use(AuthService)
  .use(BucketService)
  .use(MessagingService)
  .use(CacheService(100, 60 * 60 * 1000)) // 100 items, 1 hour
  .get(
    "/",
    async ({ programRepo, query: { clubId }, cache }) => {
      const cached = cache.get<ProgramExtended[]>(`programs_${clubId}`);
      if (cached) {
        return {
          message: "Found programs",
          data: cached,
        };
      }

      const programs = await programRepo.list({ clubId });
      cache.set(`programs_${clubId}`, programs);

      return {
        message: "Found programs",
        data: programs,
      };
    },
    {
      detail: {
        tags: ["PROGRAM"],
      },
      query: t.Object({
        clubId: t.Number(),
      }),
      response: APIResponseSchema(t.Array(SelectProgramExtendedSchema)),
    }
  )
  .post(
    "/",
    async ({ programRepo, body }) => {
      const program = await programRepo.create(body);

      return {
        message: "Program created",
        data: program,
      };
    },
    {
      detail: {
        tags: ["PROGRAM"],
      },
      body: InsertProgramSchema,
      response: APIResponseSchema(SelectProgramExtendedSchema),
      afterHandle: async ({
        programRepo,
        clubRepo,
        cache,
        body,
        response,
        messenger,
      }) => {
        const { clubId } = body;
        if (clubId) {
          cache.delete(`programs_${clubId}`);
          const programs = await programRepo.list({ clubId });
          cache.set(`programs_${clubId}`, programs);

          const program = (response as any).data as ProgramExtended;
          const club = await clubRepo.find(clubId);
          const topic = `club_${program.clubId}`;
          const msg: Message = {
            notification: {
              title: "New program just dropped! 🎉",
              body:
                program.name + " is now available in " + club.name + " club !",
              imageUrl: "https://i.imgur.com/KDza0Bz.png",
            },
            data: {
              id: `club_${program.clubId}_program_${program.id}`,
              type: "PROGRAM",
              title: "New program just dropped!",
              body: program.name,
            },
            android: {
              notification: {
                title: "New program just dropped! 🎉",
                body:
                  program.name +
                  " is now available in " +
                  club.name +
                  " club !",
                imageUrl: "https://i.imgur.com/KDza0Bz.png",
                sound: "default",
                priority: "high",
              },
            },
            topic,
          };

          await messenger.send(msg);
        }
      },
    }
  )
  .get(
    "/:id",
    async ({ programRepo, params: { id }, cache }) => {
      const cached = cache.get<ProgramExtended>(`program_${id}`);
      if (cached) {
        return {
          message: "Program found",
          data: cached,
        };
      }

      const program = await programRepo.find(id);
      cache.set(`program_${id}`, program);

      return {
        message: "Program found",
        data: program,
      };
    },
    {
      detail: {
        tags: ["PROGRAM"],
      },
      params: t.Object({
        id: t.Number(),
      }),
      response: APIResponseSchema(SelectProgramExtendedSchema),
    }
  )
  .put(
    "/:id",
    async ({ programRepo, body, params: { id } }) => {
      const program = await programRepo.update({ id, ...body });

      return {
        message: "Program updated",
        data: program,
      };
    },
    {
      detail: {
        tags: ["PROGRAM"],
      },
      params: t.Object({
        id: t.Number(),
      }),
      body: InsertProgramSchema,
      response: APIResponseSchema(SelectProgramExtendedSchema),
      afterHandle: async ({ programRepo, cache, params: { id } }) => {
        cache.delete(`program_${id}`);
        const program = await programRepo.find(id);
        cache.set(`program_${id}`, program);

        const { clubId } = program;
        if (clubId) {
          cache.delete(`programs_${clubId}`);
          const programs = await programRepo.list({ clubId });
          cache.set(`programs_${clubId}`, programs);
        }
      },
    }
  )
  .delete(
    "/:id",
    async ({ programRepo, params: { id } }) => {
      await programRepo.delete(id);

      return {
        message: "Program deleted",
      };
    },
    {
      detail: {
        tags: ["PROGRAM"],
      },
      params: t.Object({
        id: t.Number(),
      }),
      response: APIResponseSchema(SelectProgramExtendedSchema),
      afterResponse: async ({ programRepo, cache, params: { id } }) => {
        cache.delete(`program_${id}`);
        const program = await programRepo.find(id);
        cache.set(`program_${id}`, program);

        const { clubId } = program;
        if (clubId) {
          cache.delete(`programs_${clubId}`);
          const programs = await programRepo.list({ clubId });
          cache.set(`programs_${clubId}`, programs);
        }
      },
    }
  )
  .put(
    "/:id/image",
    async ({
      programRepo,
      mediaRepo,
      params: { id },
      body,
      verifyJWT,
      uploadFile,
      deleteFile,
    }) => {
      const user = await verifyJWT();

      const findProgram = await programRepo.find(id);

      const upload = await uploadFile({
        parent: "program",
        blob: body.image,
      });

      const media = await mediaRepo.create({
        creatorId: user.id,
        clubId: findProgram.clubId,
        name: body.image.name,
        fileSize: body.image.size,
        type: body.image.type as MediaType,
        parent: "program",
        url: upload.url,
      });

      const program = await programRepo.update({
        ...findProgram,
        id,
        clubId: findProgram.clubId,
        mediaId: media.id,
      });

      const { mediaId } = findProgram;
      const path = findProgram.media?.path;
      if (mediaId && path) {
        await mediaRepo.delete(mediaId);
        await deleteFile({ parent: "program", path });
      }

      return {
        message: "Program image updated",
        data: program,
      };
    },
    {
      detail: {
        tags: ["PROGRAM"],
      },
      params: t.Object({
        id: t.Number(),
      }),
      body: t.Object({
        image: t.File(),
      }),
      response: APIResponseSchema(SelectProgramExtendedSchema),
      afterResponse: async ({ programRepo, cache, params: { id } }) => {
        const program = await programRepo.find(id);
        cache.delete(`program_${id}`);
        cache.set(`program_${id}`, program);

        const { clubId } = program;
        if (clubId) {
          cache.delete(`programs_${clubId}`);
          const programs = await programRepo.list({ clubId });
          cache.set(`programs_${clubId}`, programs);
        }
      },
    }
  );
