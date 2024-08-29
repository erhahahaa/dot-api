import Elysia, { t } from "elysia";
import { GlobalDependency } from "../../core/di";
import { BucketService } from "../../core/services/bucket";
import { InsertQuestionSchema } from "./question.schema";

export const QuestionPlugin = new Elysia()
  .use(GlobalDependency)
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
      // response: APIResponseSchema(t.Array(SelectQuestionExtendedSchema)),
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
      // response: APIResponseSchema(SelectQuestionExtendedSchema),
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
      // response: APIResponseSchema(SelectQuestionExtendedSchema),
    }
  )
  .put(
    "/:id",
    async ({ questionRepo, body, params: { id } }) => {
      const question = await questionRepo.update({
        ...(body as any),
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
      // body: InsertQuestionSchema,
      // response: APIResponseSchema(SelectQuestionExtendedSchema),
    }
  )
  .delete(
    "/:id",
    async ({ questionRepo, params: { id } }) => {
      const quesiton = await questionRepo.find(id);
      await questionRepo.delete(id);
      return {
        message: "Question deleted",
        data: quesiton,
      };
    },
    {
      detail: {
        tags: ["QUESTION"],
      },
      params: t.Object({
        id: t.Number(),
      }),
      // response: APIResponseSchema(SelectQuestionExtendedSchema),
    }
  )
  .post(
    "/bulk",
    async ({ questionRepo, body }) => {
      let questions: any[] = [];
      if ((body as any).length > 0) {
        questions = await questionRepo.createBulk(body as any);
      }
      return {
        message: "Questions created",
        data: questions,
      };
    },
    {
      detail: {
        tags: ["QUESTION"],
      },
      // body: t.Array(InsertQuestionSchema),
      // response: APIResponseSchema(t.Array(SelectQuestionExtendedSchema)),
    }
  )
  .put(
    "/bulk",
    async ({ questionRepo, body }) => {
      let questions: any[] = [];
      if ((body as any).length > 0) {
        questions = await questionRepo.updateBulk(body as any);
      }

      return {
        message: "Questions updated",
        data: questions,
      };
    },
    {
      detail: {
        tags: ["QUESTION"],
      },
      // body: t.Array(InsertQuestionSchema),
      // response: APIResponseSchema(t.Array(SelectQuestionExtendedSchema)),
    }
  );
