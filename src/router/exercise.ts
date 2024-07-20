import { and, eq, gt } from "drizzle-orm";
import { db } from "~/lib";
import {
  InsertProgramExerciseSchema,
  programExercises,
} from "~/schemas/clubs/programs/exercise";
import { APIResponse } from "~/types";
import { ServerType } from "..";

export function createExerciseRouter(app: ServerType) {
  app.get("/", async ({ query: { cursor, limit, programId }, error }) => {
    if (!programId) {
      return error(400, {
        error: "Program id is required",
      } satisfies APIResponse);
    }
    const res = await db
      .select()
      .from(programExercises)
      .where(
        and(
          gt(programExercises.id, parseInt(cursor || "0")),
          eq(programExercises.programId, parseInt(programId || "0"))
        )
      )
      .limit(parseInt(limit || "10"));

    if (res.length == 0) {
      return error(404, {
        error: "No Exercises found",
      } satisfies APIResponse);
    }
    return {
      message: "Exercises found",
      data: res,
    } satisfies APIResponse;
  });
  app.get("/:id", async ({ params: { id }, error }) => {
    const res = await db
      .select()
      .from(programExercises)
      .where(eq(programExercises.id, parseInt(id)))
      .limit(1);

    if (res.length == 0) {
      return error(404, {
        error: `Exercise with id ${id} not found`,
      } satisfies APIResponse);
    }

    return {
      message: `Exercise with id ${id} found`,
      data: res[0],
    } satisfies APIResponse;
  });
  app.post(
    "/",
    async ({ body, error }) => {
      const res = await db.insert(programExercises).values(body).returning();
      if (res.length == 0) {
        return error(500, {
          error: `Failed to create ${body.name} program`,
        } satisfies APIResponse);
      }

      return {
        message: "Exercise inserted",
        data: res[0],
      } satisfies APIResponse;
    },
    {
      body: InsertProgramExerciseSchema,
    }
  );
  app.put(
    "/:id",
    async ({ params: { id }, body, error }) => {
      const program = await db
        .update(programExercises)
        .set(body)
        .where(eq(programExercises.id, parseInt(id)))
        .returning();

      if (program.length == 0) {
        return error(500, {
          error: `Failed to update program with id ${id}`,
        } satisfies APIResponse);
      }

      return {
        message: `Program with id ${id} updated`,
        data: program[0],
      } satisfies APIResponse;
    },
    {
      body: InsertProgramExerciseSchema,
    }
  );
  app.delete("/:id", async ({ params: { id }, error }) => {
    const res = await db
      .delete(programExercises)
      .where(eq(programExercises.id, parseInt(id)))
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
