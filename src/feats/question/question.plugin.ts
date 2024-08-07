import Elysia, { t } from "elysia";
import { APIResponseSchema } from "../../core/response";
import { BucketService } from "../../core/services/bucket";
import { CacheService } from "../../core/services/cache";
import { Dependency } from "./question.dependency";
import {
  InsertQuestionSchema,
  Question,
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
      afterHandle: async ({ questionRepo, cache, body }) => {
        const { examId } = body;
        if (examId) {
          cache.delete(`questions_${examId}`);
          const questions = await questionRepo.list({ examId });
          cache.set(`questions_${examId}`, questions);
        }
      },
    }
  )
  .get(
    "/:id",
    async ({ questionRepo, params: { id }, cache }) => {
      const cached = cache.get<Question>(`question_${id}`);
      if (cached) {
        return {
          message: "Question found",
          data: cached,
        };
      }

      const question = await questionRepo.find(id);
      cache.set(`question_${id}`, question);
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
      afterHandle: async ({ questionRepo, cache, params: { id } }) => {
        cache.delete(`question_${id}`);
        const question = await questionRepo.find(id);
        cache.set(`question_${id}`, question);

        const { examId } = question;
        if (examId) {
          cache.delete(`questions_${examId}`);
          const questions = await questionRepo.list({ examId });
          cache.set(`questions_${examId}`, questions);
        }
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
      afterHandle: async ({ questionRepo, cache, body, params: { id } }) => {
        cache.delete(`question_${id}`);
        const question = await questionRepo.find(id);
        cache.set(`question_${id}`, question);

        const { examId } = body;
        if (examId) {
          cache.delete(`questions_${examId}`);
          const questions = await questionRepo.list({ examId });
          cache.set(`questions_${examId}`, questions);
        }
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
      afterHandle: async ({ questionRepo, cache, params: { id } }) => {
        const question = await questionRepo.find(id);
        const { examId } = question;
        if (examId) {
          cache.delete(`questions_${examId}`);
          const questions = await questionRepo.list({ examId });
          cache.set(`questions_${examId}`, questions);
        }
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
      afterHandle: async ({ questionRepo, cache, body }) => {
        body.forEach(async ({ id, examId }) => {
          if (!id) return;
          cache.delete(`question_${id}`);
          const question = await questionRepo.find(id);
          cache.set(`question_${id}`, question);

          if (examId) {
            cache.delete(`questions_${examId}`);
            const questions = await questionRepo.list({ examId });
            cache.set(`questions_${examId}`, questions);
          }
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
      afterHandle: async ({ questionRepo, cache, body }) => {
        body.forEach(async ({ id, examId }) => {
          if (!id) return;
          cache.delete(`question_${id}`);
          const question = await questionRepo.find(id);
          cache.set(`question_${id}`, question);

          if (examId) {
            cache.delete(`questions_${examId}`);
            const questions = await questionRepo.list({ examId });
            cache.set(`questions_${examId}`, questions);
          }
        });
      },
    }
  );
