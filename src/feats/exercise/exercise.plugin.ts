import Elysia, { t } from "elysia";
import { APIResponseSchema } from "../../core/response";
import { BucketService } from "../../core/services/bucket";
import { CacheService } from "../../core/services/cache";
import { AuthService } from "../auth/auth.service";
import { Dependency } from "./exercise.dependency";
import {
  ExerciseExtended,
  InsertExerciseSchema,
  SelectExerciseExtendedSchema,
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
      response: APIResponseSchema(t.Array(SelectExerciseExtendedSchema)),
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
      response: APIResponseSchema(SelectExerciseExtendedSchema),
      afterHandle: async ({ exerciseRepo, cache, response }) => {
        const { programId } = (response as any).data as ExerciseExtended;
        if (!programId) return;
        cache.delete(`exercises_${programId}`);
        const exercises = await exerciseRepo.list({ programId });
        cache.set(`exercises_${programId}`, exercises);
      },
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
      response: APIResponseSchema(SelectExerciseExtendedSchema),
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
      response: APIResponseSchema(SelectExerciseExtendedSchema),
      afterHandle: async ({ exerciseRepo, cache, response }) => {
        const { programId } = (response as any).data as ExerciseExtended;
        if (!programId) return;
        cache.delete(`exercises_${programId}`);
        const exercises = await exerciseRepo.list({ programId });
        cache.set(`exercises_${programId}`, exercises);
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
      response: APIResponseSchema(SelectExerciseExtendedSchema),
      afterHandle: async ({ exerciseRepo, cache, response }) => {
        const { programId } = (response as any).data as ExerciseExtended;
        if (!programId) return;
        cache.delete(`exercises_${programId}`);
        const exercises = await exerciseRepo.list({ programId });
        cache.set(`exercises_${programId}`, exercises);
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
      response: APIResponseSchema(t.Array(SelectExerciseExtendedSchema)),
      afterHandle: async ({ exerciseRepo, cache, response }) => {
        const exercises = (response as any).data as ExerciseExtended[];
        exercises.forEach(async ({ programId }) => {
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
      response: APIResponseSchema(t.Array(SelectExerciseExtendedSchema)),
      afterHandle: async ({ exerciseRepo, cache, response }) => {
        const exercises = (response as any).data as ExerciseExtended[];
        exercises.forEach(async ({ programId }) => {
          if (programId) {
            cache.delete(`exercises_${programId}`);
            const exercises = await exerciseRepo.list({ programId });
            cache.set(`exercises_${programId}`, exercises);
          }
        });
      },
    }
  );
