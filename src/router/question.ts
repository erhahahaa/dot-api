import { eq } from "drizzle-orm";
import { MEDIA_QUERY_WITH } from "~/helper/query";
import { db } from "~/lib";
import {
  examQuestions,
  InsertExamQuestionSchema,
} from "~/schemas/clubs/exam/question";
import { APIResponse } from "~/types";
import { ServerType } from "..";

export function createQuestionRouter(app: ServerType) {
  app.get(
    "/",
    async ({ query: { cursor = "0", limit = "10", examId = "0" }, error }) => {
      if (!examId) {
        return error(400, {
          error: "Exam id is required",
        } satisfies APIResponse);
      }

      const find = await db.query.exams.findFirst({
        where(fields, { eq }) {
          return eq(fields.id, parseInt(examId));
        },
      });

      if (!find) {
        return error(404, {
          error: `Exam with id ${examId} not found`,
        } satisfies APIResponse);
      }

      const res = await db.query.examQuestions.findMany({
        where(fields, { and, eq, gt }) {
          return and(
            eq(fields.examId, parseInt(examId)),
            gt(fields.id, parseInt(cursor))
          );
        },
        limit: parseInt(limit),
        with: {
          media: { columns: MEDIA_QUERY_WITH },
        },
      });

      if (res.length == 0) {
        return error(404, {
          error: "No questions found",
        } satisfies APIResponse);
      }
      return {
        message: "Questions found",
        data: res,
      } satisfies APIResponse;
    }
  );
  app.get("/:id", async ({ params: { id }, error }) => {
    const res = await db
      .select()
      .from(examQuestions)
      .where(eq(examQuestions.id, parseInt(id)))
      .limit(1);

    if (res.length == 0) {
      return error(404, {
        error: `Question with id ${id} not found`,
      } satisfies APIResponse);
    }

    return {
      message: `Question with id ${id} found`,
      data: res[0],
    } satisfies APIResponse;
  });
  app.post(
    "/",
    async ({ body, error }) => {
      const { examId } = body;
      if (!examId) {
        return error(400, {
          error: "Exam id is required",
        } satisfies APIResponse);
      }

      const find = await db.query.exams.findFirst({
        where(fields, { eq }) {
          return eq(fields.id, examId);
        },
      });

      if (!find) {
        return error(404, {
          error: `Exam with id ${examId} not found`,
        } satisfies APIResponse);
      }

      const res = await db.insert(examQuestions).values(body).returning();
      if (res.length == 0) {
        return error(500, {
          error: `Failed to insert question`,
        } satisfies APIResponse);
      }

      return {
        message: "Question inserted",
        data: res[0],
      } satisfies APIResponse;
    },
    {
      body: InsertExamQuestionSchema,
    }
  );
  app.put(
    "/:id",
    async ({ params: { id }, body, error }) => {
      const { examId } = body;

      if (!examId) {
        return error(400, {
          error: "Exam id is required",
        } satisfies APIResponse);
      }

      const find = await db.query.exams.findFirst({
        where(fields, { eq }) {
          return eq(fields.id, examId);
        },
      });

      if (!find) {
        return error(404, {
          error: `Exam with id ${examId} not found`,
        } satisfies APIResponse);
      }

      const res = await db
        .update(examQuestions)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(examQuestions.id, parseInt(id)))
        .returning();

      if (res.length == 0) {
        return error(500, {
          error: `Failed to update question with id ${id}`,
        } satisfies APIResponse);
      }

      return {
        message: `Question with id ${id} updated`,
        data: res[0],
      } satisfies APIResponse;
    },
    { body: InsertExamQuestionSchema }
  );
  app.delete("/:id", async ({ params: { id }, error }) => {
    const res = await db
      .delete(examQuestions)
      .where(eq(examQuestions.id, parseInt(id)))
      .returning();

    if (res.length == 0) {
      return error(404, {
        error: `Question with id ${id} not found`,
      } satisfies APIResponse);
    }

    return {
      message: `Question with id ${id} deleted`,
      data: res[0],
    } satisfies APIResponse;
  });
  return app;
}
