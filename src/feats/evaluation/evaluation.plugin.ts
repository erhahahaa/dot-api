import Elysia, { t } from "elysia";
import { GlobalDependency } from "../../core/di";
import { APIResponseSchema } from "../../core/response";
import { AuthService } from "../auth/auth.service";
import { SelectEvaluationSchema } from "./evaluation.schema";

export const EvaluationPlugin = new Elysia()
  .use(GlobalDependency)
  .use(AuthService)
  .get(
    "/",
    async ({ evaluationRepo, query: { examId, clubId }, verifyJWT }) => {
      const user = await verifyJWT();
      let evaluations;
      if (!examId) {
        evaluations = await evaluationRepo.list({ clubId, userId: user.id });
      } else {
        evaluations = await evaluationRepo.list({ examId });
      }

      return {
        message: "Found evaluations",
        data: evaluations,
      };
    },
    {
      detail: {
        tags: ["EVALUATION"],
      },
      // query: t.Any({}),
      // query: t.Object({
      //   userId: t.Optional(t.Number()),
      //   examId: t.Optional(t.Number()),
      // }),
      // response: APIResponseSchema(t.Array(SelectEvaluationSchema)),
    }
  )
  .post(
    "/",
    async ({ evaluationRepo, body, verifyJWT }) => {
      const user = await verifyJWT();

      const evaluation = await evaluationRepo.create({
        ...(body as any),
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
      // body: InsertEvaluationSchema,
      // response: APIResponseSchema(SelectEvaluationSchema),
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
        ...(body as any),
        id,
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
      // body: InsertEvaluationSchema,
      // response: APIResponseSchema(SelectEvaluationSchema),
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
      // response: APIResponseSchema(SelectEvaluationSchema),
    }
  );
