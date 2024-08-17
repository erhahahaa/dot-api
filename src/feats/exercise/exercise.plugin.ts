import Elysia, { t } from "elysia";
import { BucketService } from "../../core/services/bucket";
import { AuthService } from "../auth/auth.service";
import { Dependency } from "./exercise.dependency";
import { InsertExerciseSchema } from "./exercise.schema";

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
      // response: APIResponseSchema(t.Array(SelectExerciseExtendedSchema)),
    }
  )
  .post(
    "/",
    async ({ exerciseRepo, body }) => {
      const exercise = await exerciseRepo.create(body as any);
      return {
        message: "Exercise created",
        data: exercise,
      };
    },
    {
      detail: {
        tags: ["EXERCISE"],
      },
      // body: InsertExerciseSchema,
      // response: APIResponseSchema(SelectExerciseExtendedSchema),
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
      // response: APIResponseSchema(SelectExerciseExtendedSchema),
    }
  )
  .put(
    "/:id",
    async ({ exerciseRepo, body, params: { id } }) => {
      const exercise = await exerciseRepo.update({
        ...(body as any),
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
      // body: InsertExerciseSchema,
      // response: APIResponseSchema(SelectExerciseExtendedSchema),
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
      // response: APIResponseSchema(SelectExerciseExtendedSchema),
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
      // response: APIResponseSchema(t.Array(SelectExerciseExtendedSchema)),
    }
  )
  .put(
    "/bulk",
    async ({ exerciseRepo, body }) => {
      console.log(body);
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
      // response: APIResponseSchema(t.Array(SelectExerciseExtendedSchema)),
    }
  );
