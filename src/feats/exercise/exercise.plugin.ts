import Elysia, { t } from "elysia";
import { APIResponseSchema } from "../../core/response";
import { BucketService } from "../../core/services/bucket";
import { CacheService } from "../../core/services/cache";
import { AuthService } from "../auth/auth.service";
import { Dependency } from "./exercise.dependency";
import {
  ExerciseExtended,
  InsertExerciseSchema,
  SelectExerciseSchema,
} from "./exercise.schema";

export const ExercisePlugin = new Elysia()
  .use(Dependency)
  .use(AuthService)
  .use(BucketService)
  .use(CacheService(100, 60 * 60 * 1000)) // 100 items, 1 hour
  .get(
    "/",
    async ({ exerciseRepo, query: { programId }, cache }) => {
      const cached = cache.get<ExerciseExtended[]>(`exercises_${programId}`);
      if (cached) {
        return {
          message: "Found exercises",
          data: cached,
        };
      }

      const exercises = await exerciseRepo.list({ programId });
      cache.set(`exercises_${programId}`, exercises);

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
      afterHandle: async ({ exerciseRepo, cache, body }) => {
        const { programId } = body;
        if (programId) {
          cache.delete(`exercises_${programId}`);
          const exercises = await exerciseRepo.list({ programId });
          cache.set(`exercises_${programId}`, exercises);
        }
      },
    }
  )
  .get(
    "/:id",
    async ({ exerciseRepo, params: { id }, cache }) => {
      const cached = cache.get<ExerciseExtended>(`exercise_${id}`);
      if (cached) {
        return {
          message: "Exercise found",
          data: cached,
        };
      }

      const exercise = await exerciseRepo.find(id);
      cache.set(`exercise_${id}`, exercise);

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
      afterHandle: async ({ exerciseRepo, cache, params: { id } }) => {
        cache.delete(`exercise_${id}`);
        const exercise = await exerciseRepo.find(id);
        cache.set(`exercise_${id}`, exercise);

        const { programId } = exercise;
        if (programId) {
          cache.delete(`exercises_${programId}`);
          const exercises = await exerciseRepo.list({ programId });
          cache.set(`exercises_${programId}`, exercises);
        }
      },
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
      afterHandle: async ({ exerciseRepo, cache, params: { id } }) => {
        cache.delete(`exercise_${id}`);
        const exercise = await exerciseRepo.find(id);
        cache.set(`exercise_${id}`, exercise);

        const { programId } = exercise;
        if (programId) {
          cache.delete(`exercises_${programId}`);
          const exercises = await exerciseRepo.list({ programId });
          cache.set(`exercises_${programId}`, exercises);
        }
      },
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
      afterHandle: async ({ exerciseRepo, cache, body }) => {
        body.forEach(async ({ id }) => {
          if (!id) return;
          cache.delete(`exercise_${id}`);
          const exercise = await exerciseRepo.find(id);
          cache.set(`exercise_${id}`, exercise);

          const { programId } = exercise;
          if (programId) {
            cache.delete(`exercises_${programId}`);
            const exercises = await exerciseRepo.list({ programId });
            cache.set(`exercises_${programId}`, exercises);
          }
        });
      },
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
      afterHandle: async ({ exerciseRepo, cache, body }) => {
        body.forEach(async ({ id }) => {
          if (!id) return;
          cache.delete(`exercise_${id}`);
          const exercise = await exerciseRepo.find(id);
          cache.set(`exercise_${id}`, exercise);

          const { programId } = exercise;
          if (programId) {
            cache.delete(`exercises_${programId}`);
            const exercises = await exerciseRepo.list({ programId });
            cache.set(`exercises_${programId}`, exercises);
          }
        });
      },
    }
  );
