import Elysia, { t } from "elysia";
import { APIResponseSchema } from "../../core/response";
import { BucketService } from "../../core/services/bucket";
import { AuthService } from "../auth/auth.service";
import { Dependency } from "./exercise.dependency";
import { InsertExerciseSchema, SelectExerciseSchema } from "./exercise.schema";

export const ExercisePlugin = new Elysia()
  .use(Dependency)
  .use(AuthService)
  .use(BucketService)
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
      detail: {
        tags: ["EXERCISE"],
      },
      query: t.Object({
        programId: t.Number(),
      }),
      response: APIResponseSchema(t.Array(SelectExerciseSchema)),
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
      detail: {
        tags: ["EXERCISE"],
      },
      body: InsertExerciseSchema,
      response: APIResponseSchema(SelectExerciseSchema),
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
      detail: {
        tags: ["EXERCISE"],
      },
      params: t.Object({
        id: t.Number(),
      }),
      response: APIResponseSchema(SelectExerciseSchema),
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
      detail: {
        tags: ["EXERCISE"],
      },
      params: t.Object({
        id: t.Number(),
      }),
      body: InsertExerciseSchema,
      response: APIResponseSchema(SelectExerciseSchema),
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
      detail: {
        tags: ["EXERCISE"],
      },
      params: t.Object({
        id: t.Number(),
      }),
      response: APIResponseSchema(SelectExerciseSchema),
    }
  )
  .post(
    "/bulk",
    async ({ exerciseRepo, body }) => {
      const exercises = await exerciseRepo.createBulk(body);
      return {
        message: "Exercises created",
        data: exercises,
      };
    },
    {
      detail: {
        tags: ["EXERCISE"],
      },
      body: t.Array(InsertExerciseSchema),
      response: APIResponseSchema(t.Array(SelectExerciseSchema)),
    }
  )
  .put(
    "/bulk",
    async ({ exerciseRepo, body }) => {
      const exercises = await exerciseRepo.updateBulk(body);
      return {
        message: "Exercises updated",
        data: exercises,
      };
    },
    {
      detail: {
        tags: ["EXERCISE"],
      },
      body: t.Array(InsertExerciseSchema),
      response: APIResponseSchema(t.Array(SelectExerciseSchema)),
    }
  );
