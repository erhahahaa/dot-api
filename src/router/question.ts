import { eq, sql } from "drizzle-orm";
import { db } from "~/db";
import { InsertQuestionSchema, questions } from "~/schemas/exam/question";
import { APIResponse } from "~/types";
import { ServerType } from "..";

export function createQuestionRouter(app: ServerType) {
  app.get("/", async ({ query: { cursor, limit, programId }, error }) => {
    if (!programId) {
      return error(400, {
        error: "Program id is required",
      } satisfies APIResponse);
    }
    const res = await db
      .select()
      .from(questions)
      .where(
        sql`program_id = ${parseInt(programId) || 0} AND id > ${parseInt(
          cursor || "0"
        )}`
      )
      .limit(parseInt(limit as string) || 10);

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
      .from(questions)
      .where(eq(questions.id, parseInt(id)))
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
      const res = await db.insert(questions).values(body).returning();
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
      body: InsertQuestionSchema,
    }
  );
  app.put(
    "/:id",
    async ({ params: { id }, body, error }) => {
      const res = await db
        .update(questions)
        .set(body)
        .where(eq(questions.id, parseInt(id)))
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
    { body: InsertQuestionSchema }
  );
  app.delete("/:id", async ({ params: { id }, error }) => {
    const res = await db
      .delete(questions)
      .where(eq(questions.id, parseInt(id)))
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
