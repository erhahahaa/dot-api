import { eq, gt } from "drizzle-orm";
import { db } from "~/db";
import { InsertProgramSchema, programs } from "~/schemas/programs";
import { APIResponse } from "~/types";
import { ServerType } from "..";

export function createProgramRouter(app: ServerType) {
  app.get("/", async ({ query: { cursor, limit } }) => {
    const res = await db
      .select()
      .from(programs)
      .where(gt(programs.id, parseInt(cursor as string) || 0))
      .limit(parseInt(limit as string) || 10);

    if (res.length == 0) {
      return {
        error: "No programs found",
      } satisfies APIResponse;
    }
    return {
      message: "Programs found",
      data: res,
    } satisfies APIResponse;
  });
  app.get("/:id", async ({ params: { id } }) => {
    const res = await db
      .select()
      .from(programs)
      .where(eq(programs.id, parseInt(id)))
      .limit(1);

    if (res.length == 0) {
      return {
        error: `Program with id ${id} not found`,
      } satisfies APIResponse;
    }

    return {
      message: `Program with id ${id} found`,
      data: res[0],
    } satisfies APIResponse;
  });
  app.post(
    "/",
    async ({ body }) => {
      const res = await db.insert(programs).values(body).returning();
      if (res.length == 0) {
        return {
          error: "Failed to insert program",
        } satisfies APIResponse;
      }

      return {
        message: "Program inserted",
        data: res[0],
      } satisfies APIResponse;
    },
    {
      body: InsertProgramSchema,
    }
  );
  app.put(
    "/:id",
    async ({ params: { id }, body }) => {
      console.log("BODY", body);
      const res = await db
        .update(programs)
        .set(body)
        .where(eq(programs.id, parseInt(id)))
        .returning();

      if (res.length == 0) {
        return {
          error: `Failed to update program with id ${id}`,
        } satisfies APIResponse;
      }

      return {
        message: `Program with id ${id} updated`,
        data: res[0],
      } satisfies APIResponse;
    },
    { body: InsertProgramSchema }
  );
  app.delete("/:id", async ({ params: { id } }) => {
    const res = await db
      .delete(programs)
      .where(eq(programs.id, parseInt(id)))
      .returning();

    if (res.length == 0) {
      return {
        error: `Failed to delete program with id ${id}`,
      } satisfies APIResponse;
    }

    return {
      message: `Program with id ${id} deleted`,
      data: res[0],
    } satisfies APIResponse;
  });
  return app;
}
