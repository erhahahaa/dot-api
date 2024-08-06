import Elysia, { t } from "elysia";
import { APIResponseSchema } from "../../core/response";
import { BucketService } from "../../core/services/bucket";
import { Dependency } from "./question.dependency";
import {
  InsertQuestionSchema,
  SelectQuestionExtendedSchema,
} from "./question.schema";

export const QuestionPlugin = new Elysia()
  .use(Dependency)
  .use(BucketService)
  .get(
    "/",
    async ({ questionRepo, query: { examId } }) => {
      const questions = await questionRepo.list({ examId });

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
    }
  )
  .get(
    "/:id",
    async ({ questionRepo, params: { id } }) => {
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
    }
  );
