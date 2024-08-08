import Elysia, { t } from "elysia";
import { APIResponseSchema } from "../../core/response";
import { CacheService } from "../../core/services/cache";
import { AuthService } from "../auth/auth.service";
import { Dependency } from "./evaluation.dependency";
import {
  Evaluation,
  InsertEvaluationSchema,
  SelectEvaluationSchema,
} from "./evaluation.schema";

export const EvaluationPlugin = new Elysia()
  .use(Dependency)
  .use(AuthService)
  .use(CacheService(100, 60 * 60 * 1000)) // 100 items, 1 hour
  .get(
    "/",
    async ({ evaluationRepo, query: { examId }, cache }) => {
      const cached = cache.get<Evaluation[]>(`evaluations_${examId}`);
      if (cached) {
        return {
          message: "Found evaluations",
          data: cached,
        };
      }

      const evaluations = await evaluationRepo.list({ examId });
      cache.set(`evaluations_${examId}`, evaluations);

      return {
        message: "Found evaluations",
        data: evaluations,
      };
    },
    {
      detail: {
        tags: ["EVALUATION"],
      },
      query: t.Object({
        examId: t.Number(),
      }),
      response: APIResponseSchema(t.Array(SelectEvaluationSchema)),
    }
  )
  .post(
    "/",
    async ({ evaluationRepo, body, verifyJWT }) => {
      const user = await verifyJWT();

      const evaluation = await evaluationRepo.create({
        ...body,
        coachId: user.id,
      });

      return {
        message: "Evaluation created",
        data: evaluation,
      };
    },
    {
      detail: {
        tags: ["EVALUATION"],
      },
      body: InsertEvaluationSchema,
      response: APIResponseSchema(SelectEvaluationSchema),
      afterHandle: async ({ cache, response }) => {
        if (!response) return;
        const { examId } = response as any as Evaluation;
        if (!examId) return;
        cache.delete(`evaluations_${examId}`);
      },
    }
  )
  .get(
    "/:id",
    async ({ evaluationRepo, params: { id } }) => {
      const evaluation = await evaluationRepo.find(id);

      return {
        message: "Evaluation found",
        data: evaluation,
      };
    },
    {
      detail: {
        tags: ["EVALUATION"],
      },
      params: t.Object({
        id: t.Number(),
      }),
      response: APIResponseSchema(SelectEvaluationSchema),
    }
  )
  .put(
    "/:id",
    async ({ evaluationRepo, params: { id }, body }) => {
      const evaluation = await evaluationRepo.update({
        ...body,
        clubId: id,
        createdAt: new Date(),
      });

      return {
        message: "Evaluation updated",
        data: evaluation,
      };
    },
    {
      detail: {
        tags: ["EVALUATION"],
      },
      params: t.Object({
        id: t.Number(),
      }),
      body: InsertEvaluationSchema,
      response: APIResponseSchema(SelectEvaluationSchema),
      afterHandle: async ({ cache, response }) => {
        if (!response) return;
        const { examId } = response as any as Evaluation;
        if (!examId) return;
        cache.delete(`evaluations_${examId}`);
      },
    }
  )
  .delete(
    "/:id",
    async ({ evaluationRepo, params: { id } }) => {
      const evaluation = await evaluationRepo.delete(id);

      return {
        message: "Evaluation deleted",
        data: evaluation,
      };
    },
    {
      detail: {
        tags: ["EVALUATION"],
      },
      params: t.Object({
        id: t.Number(),
      }),
      response: APIResponseSchema(SelectEvaluationSchema),
      afterHandle: async ({ cache, response }) => {
        if (!response) return;
        const { examId } = response as any as Evaluation;
        if (!examId) return;
        cache.delete(`evaluations_${examId}`);
      },
    }
  );
