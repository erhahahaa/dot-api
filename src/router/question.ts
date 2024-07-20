import { eq, sql } from "drizzle-orm";
import { db } from "~/lib";
import {
  examQuestions,
  InsertExamQuestionSchema,
} from "~/schemas/clubs/exam/question";
import { APIResponse } from "~/types";
import { ServerType } from "..";

export function createQuestionRouter(app: ServerType) {
  app.get("/", async ({ query: { cursor, limit, clubId }, error }) => {
    if (!clubId) {
      return error(400, {
        error: "Club id is required",
      } satisfies APIResponse);
    }
    const res = await db
      .select()
      .from(examQuestions)
      .where(
        sql`club_id = ${parseInt(clubId) || 0} AND id > ${parseInt(
          cursor || "0"
        )}`
      )
      .limit(parseInt(limit || "10"));

    if (res.length == 0) {
      return error(404, {
        error: "No questions found",
      } satisfies APIResponse);
    }
    return {
      message: "Questions found",
      data: res,
    } satisfies APIResponse;
  });
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
      const res = await db
        .update(examQuestions)
        .set(body)
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
