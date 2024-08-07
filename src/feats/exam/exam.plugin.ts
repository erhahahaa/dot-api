import Elysia, { t } from "elysia";
import { APIResponseSchema } from "../../core/response";
import { BucketService } from "../../core/services/bucket";
import { CacheService } from "../../core/services/cache";
import { AuthService } from "../auth/auth.service";
import { MediaType } from "../media/media.schema";
import { Dependency } from "./exam.dependency";
import {
  ExamExtended,
  InsertExamSchema,
  SelectExamSchema,
} from "./exam.schema";

export const ExamPlugin = new Elysia()
  .use(Dependency)
  .use(AuthService)
  .use(BucketService)
  .use(CacheService(100, 60 * 60 * 1000)) // 100 items, 1 hour
  .get(
    "/",
    async ({ examRepo, query: { clubId }, cache }) => {
      const cached = cache.get<ExamExtended[]>(`exams_${clubId}`);
      if (cached) {
        return {
          message: "Found exams",
          data: cached,
        };
      }

      const evaluations = await examRepo.list({ clubId });
      cache.set(`exams_${clubId}`, evaluations);

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
      afterHandle: async ({ examRepo, cache, body }) => {
        const { clubId } = body;
        if (clubId) {
          cache.delete(`exams_${clubId}`);
          const evaluations = await examRepo.list({ clubId });
          cache.set(`exams_${clubId}`, evaluations);
        }
      },
    }
  )
  .get(
    "/:id",
    async ({ examRepo, params: { id }, cache }) => {
      const cached = cache.get<ExamExtended>(`exam_${id}`);
      if (cached) {
        return {
          message: "Evaluation found",
          data: cached,
        };
      }

      const evaluation = await examRepo.find(id);
      cache.set(`exam_${id}`, evaluation);

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
      afterHandle: async ({ examRepo, cache, params: { id } }) => {
        cache.delete(`exam_${id}`);
        const program = await examRepo.find(id);
        cache.set(`exam_${id}`, program);

        const { clubId } = program;
        if (clubId) {
          cache.delete(`exams_${clubId}`);
          const evaluations = await examRepo.list({ clubId });
          cache.set(`exams_${clubId}`, evaluations);
        }
      },
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
      afterHandle: async ({ examRepo, cache, params: { id } }) => {
        cache.delete(`exam_${id}`);
        const program = await examRepo.find(id);
        cache.set(`exam_${id}`, program);

        const { clubId } = program;
        if (clubId) {
          cache.delete(`exams_${clubId}`);
          const evaluations = await examRepo.list({ clubId });
          cache.set(`exams_${clubId}`, evaluations);
        }
      },
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
      afterHandle: async ({ examRepo, cache, params: { id } }) => {
        cache.delete(`exam_${id}`);
        const program = await examRepo.find(id);
        cache.set(`exam_${id}`, program);

        const { clubId } = program;
        if (clubId) {
          cache.delete(`exams_${clubId}`);
          const evaluations = await examRepo.list({ clubId });
          cache.set(`exams_${clubId}`, evaluations);
        }
      },
    }
  );
