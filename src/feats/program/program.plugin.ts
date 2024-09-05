import Elysia, { t } from "elysia";
import { Message } from "firebase-admin/messaging";
import { GlobalDependency } from "../../core/di";
import { APIResponseSchema } from "../../core/response";
import { BucketService } from "../../core/services/bucket";
import { DEFAULT_IMAGE, MessagingService } from "../../core/services/fb";
import { IdParam } from "../../utils/param";
import { AuthService } from "../auth/auth.service";
import { MediaType } from "../media/media.schema";
import {
  InsertProgramSchema,
  ProgramExtended,
  SelectProgramExtendedSchema,
} from "./program.schema";

export const ProgramPlugin = new Elysia({
  name: "Day of Training Program API",
  tags: ["PROGRAM"],
})
  .use(GlobalDependency)
  .use(AuthService)
  .use(BucketService)
  .use(MessagingService)
  .model("program.insert", InsertProgramSchema)
  .model("program.response", APIResponseSchema(SelectProgramExtendedSchema))
  .use(IdParam)
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
      query: t.Object({ clubId: t.Number() }),
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
      body: "program.insert",
      response: { 200: "program.response" },
      afterHandle: async ({ clubRepo, response, messenger }) => {
        if (!response) return;
        const res = (response as any).data as ProgramExtended;
        const { id, name, clubId } = res;
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
      params: "id.param",
      response: { 200: "program.response" },
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
      params: "id.param",
      body: "program.insert",
      response: { 200: "program.response" },
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
      params: "id.param",
      response: { 200: "program.response" },
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
      params: "id.param",
      body: t.Object({
        image: t.File(),
      }),
      response: { 200: "program.response" },
    }
  );
