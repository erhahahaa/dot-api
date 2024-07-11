import { eq, gt } from "drizzle-orm";
import { db } from "~/db";
import { InsertProgramSchema, programs } from "~/schemas/clubs/programs";
import { APIResponse } from "~/types";
import { ServerType } from "..";

export function createProgramRouter(app: ServerType) {
  app.get("/", async ({ query: { cursor, limit }, error }) => {
    const res = await db
      .select()
      .from(programs)
      .where(gt(programs.id, parseInt(cursor || "0")))
      .limit(parseInt(limit || "10"));

    if (res.length == 0) {
      return error(404, {
        error: "No programs found",
      } satisfies APIResponse);
    }
    return {
      message: "Programs found",
      data: res,
    } satisfies APIResponse;
  });
  app.get("/:id", async ({ params: { id }, error }) => {
    const res = await db
      .select()
      .from(programs)
      .where(eq(programs.id, parseInt(id)))
      .limit(1);

    if (res.length == 0) {
      return error(404, {
        error: `Program with id ${id} not found`,
      } satisfies APIResponse);
    }

    return {
      message: `Program with id ${id} found`,
      data: res[0],
    } satisfies APIResponse;
  });
  app.post(
    "/",
    async ({ body, error }) => {
      const res = await db.insert(programs).values(body).returning();
      if (res.length == 0) {
        return error(500, {
          error: `Failed to create program`,
        } satisfies APIResponse);
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
    async ({ params: { id }, body, error }) => {
      const res = await db
        .update(programs)
        .set(body)
        .where(eq(programs.id, parseInt(id)))
        .returning();

      if (res.length == 0) {
        return error(500, {
          error: `Failed to update program with id ${id}`,
        } satisfies APIResponse);
      }

      return {
        message: `Program with id ${id} updated`,
        data: res[0],
      } satisfies APIResponse;
    },
    { body: InsertProgramSchema }
  );
  app.delete("/:id", async ({ params: { id }, error }) => {
    const res = await db
      .delete(programs)
      .where(eq(programs.id, parseInt(id)))
      .returning();

    if (res.length == 0) {
      return error(500, {
        error: `Failed to delete program with id ${id}`,
      } satisfies APIResponse);
    }

    return {
      message: `Program with id ${id} deleted`,
      data: res[0],
    } satisfies APIResponse;
  });

  return app;
}
