import Elysia, { t } from "elysia";
import { APIResponseSchema } from "../../core/response";
import { BucketService } from "../../core/services/bucket";
import { AuthService } from "../auth/auth.service";
import { MediaType } from "../media/media.schema";
import { Dependency } from "./program.dependency";
import {
  InsertProgramSchema,
  SelectProgramExtendedSchema,
} from "./program.schema";

export const ProgramPlugin = new Elysia()
  .use(Dependency)
  .use(AuthService)
  .use(BucketService)
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
    async ({ programRepo, body, verifyJWT }) => {
      const user = await verifyJWT();

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
