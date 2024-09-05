import Elysia, { t } from "elysia";
import { GlobalDependency } from "../../core/di";
import { APIResponseSchema } from "../../core/response";
import { BucketService } from "../../core/services/bucket";
import { IdParam } from "../../utils/param";
import { AuthService } from "../auth/auth.service";
import {
  ExerciseExtended,
  InsertExerciseSchema,
  SelectExerciseExtendedSchema,
} from "./exercise.schema";

export const ExercisePlugin = new Elysia({
  name: "Day of Training Exercise API",
  tags: ["EXERCISE"],
})
  .use(GlobalDependency)
  .use(AuthService)
  .use(BucketService)
  .model("exercise.insert", InsertExerciseSchema)
  .model("exercise.response", APIResponseSchema(SelectExerciseExtendedSchema))
  .model(
    "exercise.bulk",
    APIResponseSchema(t.Array(SelectExerciseExtendedSchema))
  )
  .use(IdParam)
  .get(
    "/",
    async ({ exerciseRepo, query: { programId } }) => {
      const exercises = await exerciseRepo.list({ programId });
      return {
        message: "Found exercises",
        data: exercises,
      };
    },
    {
      query: t.Object({
        programId: t.Number(),
      }),
      response: { 200: "exercise.bulk" },
    }
  )
  .post(
    "/",
    async ({ exerciseRepo, body }) => {
      const exercise = await exerciseRepo.create(body);
      return {
        message: "Exercise created",
        data: exercise,
      };
    },
    {
      body: "exercise.insert",
      response: { 200: "exercise.response" },
    }
  )
  .get(
    "/:id",
    async ({ exerciseRepo, params: { id } }) => {
      const exercise = await exerciseRepo.find(id);

      return {
        message: "Exercise found",
        data: exercise,
      };
    },
    {
      params: "id.param",
      response: { 200: "exercise.response" },
    }
  )
  .put(
    "/:id",
    async ({ exerciseRepo, body, params: { id } }) => {
      const exercise = await exerciseRepo.update({
        ...body,
        id,
      });
      return {
        message: "Exercise updated",
        data: exercise,
      };
    },
    {
      params: "id.param",
      body: "exercise.insert",
      response: { 200: "exercise.response" },
    }
  )
  .delete(
    "/:id",
    async ({ exerciseRepo, params: { id } }) => {
      const exercise = await exerciseRepo.delete(id);
      return {
        message: "Exercise deleted",
        data: exercise,
      };
    },
    {
      params: "id.param",
      response: { 200: "exercise.response" },
    }
  )
  .post(
    "/bulk",
    async ({ exerciseRepo, body }) => {
      const exercises: ExerciseExtended[] = [];
      if (body.length > 0) {
        const res = await exerciseRepo.createBulk(body);
        exercises.push(...res);
      }
      return {
        message: "Exercises created",
        data: exercises,
      };
    },
    {
      body: t.Array(InsertExerciseSchema),
      response: { 200: "exercise.bulk" },
    }
  )
  .put(
    "/bulk",
    async ({ exerciseRepo, body }) => {
      const exercises: ExerciseExtended[] = [];
      if (body.length > 0) {
        const res = await exerciseRepo.updateBulk(body);
        exercises.push(...res);
      }
      return {
        message: "Exercises updated",
        data: exercises,
      };
    },
    {
      body: t.Array(InsertExerciseSchema),
      response: { 200: "exercise.bulk" },
    }
  );
