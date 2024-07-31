import { eq } from "drizzle-orm";
import { db } from "~/lib";
import {
  examEvaluations,
  InsertExamEvaluationSchema,
} from "~/schemas/clubs/exam/evaluation";
import { APIResponse } from "~/types";
import { ServerType } from "..";

export function createEvaluationRouter(app: ServerType) {
  app.get(
    "/",
    async ({
      query: { cursor = "0", limit = "10", clubId = "0" },
      error,
      jwt,
      bearer,
    }) => {
      const user = await jwt.verify(bearer);
      if (!user || !user.id) {
        return error(401, { error: "Unauthorized" } satisfies APIResponse);
      }
      if (!clubId) {
        return error(400, {
          error: "Club id is required",
        } satisfies APIResponse);
      }

      const find = await db.query.clubs.findFirst({
        where(fields, { eq }) {
          return eq(fields.id, parseInt(clubId));
        },
      });

      if (!find) {
        return error(404, {
          error: `Club with id ${clubId} not found`,
        } satisfies APIResponse);
      }

      const res = await db.query.examEvaluations.findMany({
        where(fields, { gt }) {
          return gt(fields.id, parseInt(cursor));
        },
        limit: parseInt(limit),
      });

      if (res.length == 0) {
        return error(404, {
          error: "No evaluations found",
        } satisfies APIResponse);
      }

      for (const evaluation of res as any) {
        evaluation.media = evaluation.image;
        delete evaluation.image;
      }

      return {
        message: "Evaluations found",
        data: res,
      } satisfies APIResponse;
    }
  );

  app.get("/:id", async ({ params: { id }, error, jwt, bearer }) => {
    const user = await jwt.verify(bearer);
    if (!user || !user.id) {
      return error(401, { error: "Unauthorized" } satisfies APIResponse);
    }
    const res = await db.query.examEvaluations.findFirst({
      where: (fields, { eq }) => eq(fields.id, parseInt(id)),
    });

    if (!res) {
      return error(404, {
        error: `Evaluation with id ${id} not found`,
      } satisfies APIResponse);
    }

    return {
      message: "Evaluation found",
      data: res,
    } satisfies APIResponse;
  });

  app.post(
    "/",
    async ({ body, error, jwt, bearer }) => {
      const user = await jwt.verify(bearer);
      if (!user || !user.id) {
        return error(401, { error: "Unauthorized" } satisfies APIResponse);
      }

      const evaluation = await db
        .insert(examEvaluations)
        .values({
          ...body,
          coachId: parseInt(user.id as string),
        })
        .returning();

      if (evaluation.length == 0) {
        return error(500, {
          error: "Failed to create evaluation",
        } satisfies APIResponse);
      }

      return {
        message: "Evaluation created",
        data: evaluation,
      } satisfies APIResponse;
    },
    {
      body: InsertExamEvaluationSchema,
    }
  );

  app.put(
    "/:id",
    async ({ params: { id }, body, error, jwt, bearer }) => {
      const user = await jwt.verify(bearer);
      if (!user || !user.id) {
        return error(401, { error: "Unauthorized" } satisfies APIResponse);
      }

      const evaluation = await db
        .update(examEvaluations)
        .set({
          ...body,
          coachId: parseInt(user.id as string),
          updatedAt: new Date(),
        })
        .where(eq(examEvaluations.id, parseInt(id)))
        .returning();

      if (evaluation.length == 0) {
        return error(500, {
          error: "Failed to update evaluation",
        } satisfies APIResponse);
      }

      return {
        message: "Evaluation updated",
        data: evaluation,
      } satisfies APIResponse;
    },
    {
      body: InsertExamEvaluationSchema,
    }
  );

  app.delete("/:id", async ({ params: { id }, error, jwt, bearer }) => {
    const user = await jwt.verify(bearer);
    if (!user || !user.id) {
      return error(401, { error: "Unauthorized" } satisfies APIResponse);
    }

    const evaluation = await db
      .delete(examEvaluations)
      .where(eq(examEvaluations.id, parseInt(id)))
      .returning();

    if (evaluation.length == 0) {
      return error(500, {
        error: "Failed to delete evaluation",
      } satisfies APIResponse);
    }

    return {
      message: "Evaluation deleted",
      data: evaluation,
    } satisfies APIResponse;
  });

  return app;
}
