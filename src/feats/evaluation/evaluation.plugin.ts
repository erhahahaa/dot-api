import Elysia, { t } from "elysia";
import { APIResponseSchema } from "../../core/response";
import { AuthService } from "../auth/auth.service";
import { Dependency } from "./evaluation.dependency";
import { SelectEvaluationSchema } from "./evaluation.schema";

export const EvaluationPlugin = new Elysia()
  .use(Dependency)
  .use(AuthService)
  .get(
    "/",
    async ({ evaluationRepo, query: { examId, userId } }) => {
      const evaluations = await evaluationRepo.list({ examId, userId });

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
        userId: t.Optional(t.Number()),
        examId: t.Number(),
      }),
      // response: APIResponseSchema(t.Array(SelectEvaluationSchema)),
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
        ...body,
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
