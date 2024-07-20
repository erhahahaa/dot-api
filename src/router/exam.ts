import { eq, gt } from "drizzle-orm";
import { db } from "~/lib";
import { exams, InsertExamSchema } from "~/schemas/clubs/exam";
import { APIResponse } from "~/types";
import { ServerType } from "..";

export function createExamRouter(app: ServerType) {
  app.get("/", async ({ query: { cursor, limit }, error }) => {
    const res = await db
      .select()
      .from(exams)
      .where(gt(exams.id, parseInt(cursor as string) || 0))
      .limit(parseInt(limit as string) || 10);

    if (res.length == 0) {
      return error(404, {
        error: "No exams found",
      } satisfies APIResponse);
    }
    return {
      message: "Exams found",
      data: res,
    } satisfies APIResponse;
  });
  app.get("/:id", async ({ params: { id }, error }) => {
    const res = await db
      .select()
      .from(exams)
      .where(eq(exams.id, parseInt(id)))
      .limit(1);

    if (res.length == 0) {
      return error(404, {
        error: `Exam with id ${id} not found`,
      } satisfies APIResponse);
    }

    return {
      message: `Exam with id ${id} found`,
      data: res[0],
    } satisfies APIResponse;
  });
  app.post(
    "/",
    async ({ body, error }) => {
      const { dueAt, ...rest } = body;

      const res = await db
        .insert(exams)
        .values({
          ...rest,
          dueAt: new Date(dueAt || new Date()),
        })
        .returning();
      if (res.length == 0) {
        return error(500, {
          error: `Failed to insert exam`,
        } satisfies APIResponse);
      }

      return {
        message: "Exam inserted",
        data: res[0],
      } satisfies APIResponse;
    },
    {
      body: InsertExamSchema,
    }
  );
  app.put(
    "/:id",
    async ({ params: { id }, body, error }) => {
      const { dueAt, ...rest } = body;

      const res = await db
        .update(exams)
        .set({
          ...rest,
          dueAt: new Date(dueAt || new Date()),
        })
        .where(eq(exams.id, parseInt(id)))
        .returning();

      if (res.length == 0) {
        return error(500, {
          error: `Failed to update exam with id ${id}`,
        } satisfies APIResponse);
      }

      return {
        message: `Exam with id ${id} updated`,
        data: res[0],
      } satisfies APIResponse;
    },
    { body: InsertExamSchema }
  );
  app.delete("/:id", async ({ params: { id }, error }) => {
    const res = await db
      .delete(exams)
      .where(eq(exams.id, parseInt(id)))
      .returning();

    if (res.length == 0) {
      return error(500, {
        error: `Failed to delete exam with id ${id}`,
      } satisfies APIResponse);
    }

    return {
      message: `Exam with id ${id} deleted`,
      data: res[0],
    } satisfies APIResponse;
  });
  return app;
}
