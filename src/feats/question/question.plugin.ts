import Elysia, { t } from "elysia";
import { GlobalDependency } from "../../core/di";
import { APIResponseSchema } from "../../core/response";
import { BucketService } from "../../core/services/bucket";
import { IdParam } from "../../utils/param";
import {
  InsertQuestionSchema,
  QuestionExtended,
  SelectQuestionExtendedSchema,
} from "./question.schema";

export const QuestionPlugin = new Elysia({
  name: "Day of Training Question API",
  tags: ["QUESTION"],
})
  .use(GlobalDependency)
  .use(BucketService)
  .model("question.insert", InsertQuestionSchema)
  .model("question.single", APIResponseSchema(SelectQuestionExtendedSchema))
  .model(
    "question.bulk",
    APIResponseSchema(t.Array(SelectQuestionExtendedSchema))
  )
  .use(IdParam)
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
      query: t.Object({ examId: t.Number() }),
      response: { 200: "question.bulk" },
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
      body: "question.insert",
      response: { 200: "question.single" },
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
      params: "id.param",
      response: { 200: "question.single" },
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
      params: "id.param",
      body: "question.insert",
      response: { 200: "question.single" },
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
      params: "id.param",
      response: { 200: "question.single" },
    }
  )
  .post(
    "/bulk",
    async ({ questionRepo, body }) => {
      const questions: QuestionExtended[] = [];
      if (body.length > 0) {
        const res = await questionRepo.createBulk(body);
        questions.push(...res);
      }
      return {
        message: "Questions created",
        data: questions,
      };
    },
    {
      body: t.Array(InsertQuestionSchema),
      response: { 200: "question.bulk" },
    }
  )
  .put(
    "/bulk",
    async ({ questionRepo, body }) => {
      const questions: QuestionExtended[] = [];
      if (body.length > 0) {
        const res = await questionRepo.updateBulk(body);
        questions.push(...res);
      }

      return {
        message: "Questions updated",
        data: questions,
      };
    },
    {
      body: t.Array(InsertQuestionSchema),
      response: { 200: "question.bulk" },
    }
  );
