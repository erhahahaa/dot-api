import Elysia, { t } from "elysia";
import { GlobalDependency } from "../../core/di";
import { APIResponseSchema } from "../../core/response";
import { IdParam } from "../../utils/param";
import { AuthService } from "../auth/auth.service";
import {
  InsertEvaluationSchema,
  SelectEvaluationSchema,
} from "./evaluation.schema";

export const EvaluationPlugin = new Elysia({
  name: "Day of Training Evaluation API",
  tags: ["EVALUATION"],
})
  .use(GlobalDependency)
  .use(AuthService)
  .model("evaluation.insert", InsertEvaluationSchema)
  .model("evaluation.response", APIResponseSchema(SelectEvaluationSchema))
  .use(IdParam)
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
      query: t.Object({
        clubId: t.Optional(t.Number()),
        examId: t.Optional(t.Number()),
      }),
      // response: { 200: APIResponseSchema(t.Array(SelectEvaluationSchema)) },
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
      body: "evaluation.insert",
      response: { 200: "evaluation.response" },
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
      params: "id.param",
      response: { 200: "evaluation.response" },
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
      params: "id.param",
      body: "evaluation.insert",
      response: { 200: "evaluation.response" },
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
      params: "id.param",
      response: { 200: "evaluation.response" },
    }
  );
