import Elysia, { t } from "elysia";
import { APIResponseSchema } from "../../core/response";
import { BucketService } from "../../core/services/bucket";
import { AuthService } from "../auth/auth.service";
import { MediaType } from "../media/media.schema";
import { Dependency } from "./exam.dependency";
import { InsertExamSchema, SelectExamSchema } from "./exam.schema";

export const ExamPlugin = new Elysia()
  .use(Dependency)
  .use(AuthService)
  .use(BucketService)
  .get(
    "/",
    async ({ examRepo, query: { clubId } }) => {
      const evaluations = await examRepo.list({ clubId });

      return {
        message: "Found evaluations",
        data: evaluations,
      };
    },
    {
      detail: {
        tags: ["EXAM"],
      },
      query: t.Object({
        clubId: t.Number(),
      }),
      response: APIResponseSchema(t.Array(SelectExamSchema)),
    }
  )
  .post(
    "/",
    async ({ examRepo, body }) => {
      const evaluation = await examRepo.create(body);
      return {
        message: "Evaluation created",
        data: evaluation,
      };
    },
    {
      detail: {
        tags: ["EXAM"],
      },
      body: InsertExamSchema,
      response: APIResponseSchema(SelectExamSchema),
    }
  )
  .get(
    "/:id",
    async ({ examRepo, params: { id } }) => {
      const evaluation = await examRepo.find(id);
      return {
        message: "Evaluation found",
        data: evaluation,
      };
    },
    {
      detail: {
        tags: ["EXAM"],
      },
      params: t.Object({
        id: t.Number(),
      }),
      response: APIResponseSchema(SelectExamSchema),
    }
  )
  .put(
    "/:id",
    async ({ examRepo, params: { id }, body }) => {
      const evaluation = await examRepo.update({
        ...body,
        id,
        updatedAt: new Date(),
      });
      return {
        message: "Evaluation updated",
        data: evaluation,
      };
    },
    {
      detail: {
        tags: ["EXAM"],
      },
      params: t.Object({
        id: t.Number(),
      }),
      body: InsertExamSchema,
      response: APIResponseSchema(SelectExamSchema),
    }
  )
  .delete(
    "/:id",
    async ({ examRepo, params: { id } }) => {
      const evaluation = await examRepo.delete(id);
      return {
        message: "Evaluation deleted",
        data: evaluation,
      };
    },
    {
      detail: {
        tags: ["EXAM"],
      },
      params: t.Object({
        id: t.Number(),
      }),
      response: APIResponseSchema(SelectExamSchema),
    }
  )
  .put(
    "/:id/image",
    async ({
      examRepo,
      mediaRepo,
      params: { id },
      body,
      uploadFile,
      deleteFile,
    }) => {
      const { mediaId, title } = await examRepo.find(id);

      const upload = await uploadFile({
        parent: "exam",
        blob: body.image,
      });

      const updateMedia = await mediaRepo.update({
        name: body.image.name,
        type: body.image.type as MediaType,
        parent: "exam",
        url: upload.url,
        path: upload.name,
      });

      const exam = await examRepo.update({
        title,
        mediaId: updateMedia.id,
      });

      if (mediaId) {
        const { path } = await mediaRepo.find(mediaId);
        if (path) await deleteFile({ parent: "exam", path: path });
      }

      return {
        message: "Exam image updated",
        data: exam,
      };
    },
    {
      detail: {
        tags: ["EXAM"],
      },
      params: t.Object({
        id: t.Number(),
      }),
      body: t.Object({
        image: t.File(),
      }),
      response: APIResponseSchema(t.Object({})),
    }
  );
