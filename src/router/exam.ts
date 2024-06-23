import { eq, gt } from "drizzle-orm";
import { db } from "~/db";
import { exams, InsertExamSchema } from "~/schemas/exam";
import { APIResponse } from "~/types";
import { ServerType } from "..";

export function createExamRouter(app: ServerType) {
  app.get("/", async ({ query: { cursor, limit } }) => {
    const res = await db
      .select()
      .from(exams)
      .where(gt(exams.id, parseInt(cursor as string) || 0))
      .limit(parseInt(limit as string) || 10);

    if (res.length == 0) {
      return {
        error: "No exams found",
      } satisfies APIResponse;
    }
    return {
      message: "Exams found",
      data: res,
    } satisfies APIResponse;
  });
  app.get("/:id", async ({ params: { id } }) => {
    const res = await db
      .select()
      .from(exams)
      .where(eq(exams.id, parseInt(id)))
      .limit(1);

    if (res.length == 0) {
      return {
        error: `Exam with id ${id} not found`,
      } satisfies APIResponse;
    }

    return {
      message: `Exam with id ${id} found`,
      data: res[0],
    } satisfies APIResponse;
  });
  app.post(
    "/",
    async ({ body }) => {
      const res = await db.insert(exams).values(body).returning();
      if (res.length == 0) {
        return {
          error: "Failed to insert exam",
        } satisfies APIResponse;
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
    async ({ params: { id }, body }) => {
      const res = await db
        .update(exams)
        .set(body)
        .where(eq(exams.id, parseInt(id)))
        .returning();

      if (res.length == 0) {
        return {
          error: `Failed to update exam with id ${id}`,
        } satisfies APIResponse;
      }
    },
    { body: InsertExamSchema }
  );
  app.delete("/:id", async ({ params: { id } }) => {
    const res = await db
      .delete(exams)
      .where(eq(exams.id, parseInt(id)))
      .returning();

    if (res.length == 0) {
      return {
        error: `Failed to delete exam with id ${id}`,
      } satisfies APIResponse;
    }

    return {
      message: `Exam with id ${id} deleted`,
      data: res[0],
    } satisfies APIResponse;
  });
  return app;
}
