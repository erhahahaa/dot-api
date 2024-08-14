import Elysia, { t } from "elysia";
import { Message } from "firebase-admin/messaging";
import { APIResponseSchema } from "../../core/response";
import { BucketService } from "../../core/services/bucket";
import { DEFAULT_IMAGE, MessagingService } from "../../core/services/fb";
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
  .get(
    "/",
    async ({ programRepo, query: { clubId } }) => {
      const programs = await programRepo.list({ clubId });

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
      afterHandle: async ({ clubRepo, response, messenger }) => {
        if (!response) return;
        const { id, name, clubId } = (response as any).data as ProgramExtended;
        if (!clubId) return;

        const { name: clubName } = await clubRepo.find(clubId);
        const topic = `club_${clubId}`;

        const messageBody = `${name} program is now available in ${clubName} club !`;
        const title = "New program just dropped! 🎉";
        const data = {
          id: `club_${clubId}_program_${id}`,
          type: "EXAM",
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
    async ({ programRepo, params: { id } }) => {
      const program = await programRepo.find(id);

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
    }
  )
  .delete(
    "/:id",
    async ({ programRepo, params: { id } }) => {
      const program = await programRepo.delete(id);

      return {
        message: "Program deleted",
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
    }
  );
