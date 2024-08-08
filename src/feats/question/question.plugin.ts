import Elysia, { t } from "elysia";
import { APIResponseSchema } from "../../core/response";
import { BucketService } from "../../core/services/bucket";
import { CacheService } from "../../core/services/cache";
import { Dependency } from "./question.dependency";
import {
  InsertQuestionSchema,
  Question,
  QuestionExtended,
  SelectQuestionExtendedSchema,
} from "./question.schema";

export const QuestionPlugin = new Elysia()
  .use(Dependency)
  .use(BucketService)
  .use(CacheService(100, 60 * 60 * 1000)) // 100 items, 1 hour
  .get(
    "/",
    async ({ questionRepo, query: { examId }, cache }) => {
      const cached = cache.get<Question[]>(`questions_${examId}`);
      if (cached) {
        return {
          message: "Found questions",
          data: cached,
        };
      }

      const questions = await questionRepo.list({ examId });
      cache.set(`questions_${examId}`, questions);

      return {
        message: "Found questions",
        data: questions,
      };
    },
    {
      detail: {
        tags: ["QUESTION"],
      },
      query: t.Object({
        examId: t.Number(),
      }),
      response: APIResponseSchema(t.Array(SelectQuestionExtendedSchema)),
    }
  )
  .post(
    "/",
    async ({ questionRepo, body }) => {
      const question = await questionRepo.create(body);
      return {
        message: "Question created",
        data: question,
      };
    },
    {
      detail: {
        tags: ["QUESTION"],
      },
      body: InsertQuestionSchema,
      response: APIResponseSchema(SelectQuestionExtendedSchema),
      afterHandle: async ({ questionRepo, cache, response }) => {
        if (!response) return;
        const { examId } = (response as any).data as QuestionExtended;
        if (!examId) return;
        cache.delete(`questions_${examId}`);
      },
    }
  )
  .get(
    "/:id",
    async ({ questionRepo, params: { id }, cache }) => {
      const question = await questionRepo.find(id);

      return {
        message: "Question found",
        data: question,
      };
    },
    {
      detail: {
        tags: ["QUESTION"],
      },
      params: t.Object({
        id: t.Number(),
      }),
      response: APIResponseSchema(SelectQuestionExtendedSchema),
      afterHandle: async ({ questionRepo, cache, response }) => {
        if (!response) return;
        const { examId } = (response as any).data as QuestionExtended;
        if (!examId) return;
        cache.delete(`questions_${examId}`);
      },
    }
  )
  .put(
    "/:id",
    async ({ questionRepo, body, params: { id } }) => {
      const question = await questionRepo.update({
        ...body,
        id,
        updatedAt: new Date(),
      });
      return {
        message: "Question updated",
        data: question,
      };
    },
    {
      detail: {
        tags: ["QUESTION"],
      },
      params: t.Object({
        id: t.Number(),
      }),
      body: InsertQuestionSchema,
      response: APIResponseSchema(SelectQuestionExtendedSchema),
      afterHandle: async ({ questionRepo, cache, response }) => {
        if (!response) return;
        const { examId } = (response as any).data as QuestionExtended;
        if (!examId) return;
        cache.delete(`questions_${examId}`);
      },
    }
  )
  .delete(
    "/:id",
    async ({ questionRepo, params: { id } }) => {
      await questionRepo.delete(id);
      return {
        message: "Question deleted",
      };
    },
    {
      detail: {
        tags: ["QUESTION"],
      },
      params: t.Object({
        id: t.Number(),
      }),
      response: APIResponseSchema(SelectQuestionExtendedSchema),
      afterHandle: async ({ questionRepo, cache, response }) => {
        if (!response) return;
        const { examId } = (response as any).data as QuestionExtended;
        if (!examId) return;
        cache.delete(`questions_${examId}`);
      },
    }
  )
  .post(
    "/bulk",
    async ({ questionRepo, body }) => {
      const questions = await questionRepo.createBulk(body);
      return {
        message: "Questions created",
        data: questions,
      };
    },
    {
      detail: {
        tags: ["QUESTION"],
      },
      body: t.Array(InsertQuestionSchema),
      response: APIResponseSchema(t.Array(SelectQuestionExtendedSchema)),
      afterHandle: async ({ questionRepo, cache, response }) => {
        if (!response) return;
        const questions = (response as any).data as QuestionExtended[];
        questions.forEach(async ({ examId }) => {
          if (examId) cache.delete(`questions_${examId}`);
        });
      },
    }
  )
  .put(
    "/bulk",
    async ({ questionRepo, body }) => {
      const questions = await questionRepo.updateBulk(body);
      return {
        message: "Questions updated",
        data: questions,
      };
    },
    {
      detail: {
        tags: ["QUESTION"],
      },
      body: t.Array(InsertQuestionSchema),
      response: APIResponseSchema(t.Array(SelectQuestionExtendedSchema)),
      afterHandle: async ({ questionRepo, cache, response }) => {
        if (!response) return;
        const questions = (response as any).data as QuestionExtended[];
        questions.forEach(async ({ examId }) => {
          if (examId) cache.delete(`questions_${examId}`);
        });
      },
    }
  );
