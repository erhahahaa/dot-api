import { and, eq, gt } from "drizzle-orm";
import { db } from "~/lib";
import { InsertProgramSchema, programs } from "~/schemas/clubs/programs";
import { APIResponse } from "~/types";
import { ServerType } from "..";

export function createProgramRouter(app: ServerType) {
  app.get("/", async ({ query: { cursor, limit, clubId }, error }) => {
    if (!clubId) {
      return error(400, {
        error: "Club id is required",
      } satisfies APIResponse);
    }
    const res = await db
      .select()
      .from(programs)
      .where(
        and(
          gt(programs.id, parseInt(cursor || "0")),
          eq(programs.clubId, parseInt(clubId || "0"))
        )
      )
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
      const program = await db.insert(programs).values(body).returning();
      if (program.length == 0) {
        return error(500, {
          error: `Failed to create ${body.name} program`,
        } satisfies APIResponse);
      }

      // for (const exercise of body.exercises) {
      //   exercise.programId = program[0].id;
      // }

      // const exercises = await db
      //   .insert(programExercises)
      //   .values(body.exercises)
      //   .returning();
      // if (exercises.length == 0) {
      //   return error(500, {
      //     error: `Failed to create program exercises`,
      //   });
      // }

      return {
        message: "Program inserted",
        data: program[0],
      } satisfies APIResponse;
    },
    {
      body: InsertProgramSchema,
    }
  );
  app.put(
    "/:id",
    async ({ params: { id }, body, error }) => {
      const program = await db
        .update(programs)
        .set(body)
        .where(eq(programs.id, parseInt(id)))
        .returning();

      if (program.length == 0) {
        return error(500, {
          error: `Failed to update program with id ${id}`,
        } satisfies APIResponse);
      }

      // let exercises = [];
      // for (const exercise of body.exercises) {
      //   if (exercise.id == undefined) continue;

      //   exercise.programId = parseInt(id);
      //   const update = await db
      //     .update(programExercises)
      //     .set(exercise)
      //     .where(eq(programExercises.id, exercise.id))
      //     .returning();

      //   if (update.length != 0) exercises.push(update);
      // }

      // if (exercises.length == 0) {
      //   return error(500, {
      //     error: `Failed to update program exercises`,
      //   });
      // }

      return {
        message: `Program with id ${id} updated`,
        data: program[0],
      } satisfies APIResponse;
    },
    {
      body: InsertProgramSchema,
    }
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
