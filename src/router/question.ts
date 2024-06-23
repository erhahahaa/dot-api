import { eq, gt } from "drizzle-orm";
import { db } from "~/db";
import { InsertQuestionSchema, questions } from "~/schemas/exam/question";
import { APIResponse } from "~/types";
import { ServerType } from "..";

export function createQuestionRouter(app: ServerType) {
  app.get("/", async ({ query: { cursor, limit } }) => {
    const res = await db
      .select()
      .from(questions)
      .where(gt(questions.id, parseInt(cursor as string) || 0))
      .limit(parseInt(limit as string) || 10);

    if (res.length == 0) {
      return {
        error: "No questions found",
      } satisfies APIResponse;
    }
    return {
      message: "Questions found",
      data: res,
    } satisfies APIResponse;
  });
  app.get("/:id", async ({ params: { id } }) => {
    const res = await db
      .select()
      .from(questions)
      .where(eq(questions.id, parseInt(id)))
      .limit(1);

    if (res.length == 0) {
      return {
        error: `Question with id ${id} not found`,
      } satisfies APIResponse;
    }

    return {
      message: `Question with id ${id} found`,
      data: res[0],
    } satisfies APIResponse;
  });
  app.post(
    "/",
    async ({ body }) => {
      const res = await db.insert(questions).values(body).returning();
      if (res.length == 0) {
        return {
          error: "Failed to insert question",
        } satisfies APIResponse;
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
    async ({ params: { id }, body }) => {
      const res = await db
        .update(questions)
        .set(body)
        .where(eq(questions.id, parseInt(id)))
        .returning();

      if (res.length == 0) {
        return {
          error: `Failed to update question with id ${id}`,
        } satisfies APIResponse;
      }

      return {
        message: `Question with id ${id} updated`,
        data: res[0],
      } satisfies APIResponse;
    },
    { body: InsertQuestionSchema }
  );
  app.delete("/:id", async ({ params: { id } }) => {
    const res = await db
      .delete(questions)
      .where(eq(questions.id, parseInt(id)))
      .returning();

    if (res.length == 0) {
      return {
        error: `Failed to delete question with id ${id}`,
      } satisfies APIResponse;
    }

    return {
      message: `Question with id ${id} deleted`,
      data: res[0],
    } satisfies APIResponse;
  });
  return app;
}
