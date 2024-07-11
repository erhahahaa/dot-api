import { eq, gt } from "drizzle-orm";
import { db } from "~/db";
import { InsertClubSchema, clubs } from "~/schemas/clubs";
import { APIResponse } from "~/types";
import { ServerType } from "..";

export function createClubRouter(app: ServerType) {
  app.get("/", async ({ query: { cursor, limit }, error }) => {
    const res = await db
      .select()
      .from(clubs)
      .where(gt(clubs.id, parseInt(cursor as string) || 0))
      .limit(parseInt(limit as string) || 10);

    if (res.length == 0) {
      return error(404, {
        error: "No clubs found",
      } satisfies APIResponse);
    }
    return {
      message: "Clubs found",
      data: res,
    } satisfies APIResponse;
  });
  app.get("/:id", async ({ params: { id }, error }) => {
    const res = await db
      .select()
      .from(clubs)
      .where(eq(clubs.id, parseInt(id)))
      .limit(1);

    if (res.length == 0) {
      return error(404, {
        error: `Club with id ${id} not found`,
      } satisfies APIResponse);
    }

    return {
      message: `Club with id ${id} found`,
      data: res[0],
    } satisfies APIResponse;
  });
  app.post(
    "/",
    async ({ body, error }) => {
      const res = await db.insert(clubs).values(body).returning();
      if (res.length == 0) {
        return error(500, {
          error: `Failed to insert club`,
        } satisfies APIResponse);
      }

      return {
        message: "Club inserted",
        data: res[0],
      } satisfies APIResponse;
    },
    {
      body: InsertClubSchema,
    }
  );
  app.put(
    "/:id",
    async ({ params: { id }, body, error }) => {
      console.log("BODY", body);
      const res = await db
        .update(clubs)
        .set(body)
        .where(eq(clubs.id, parseInt(id)))
        .returning();

      if (res.length == 0) {
        return error(500, {
          error: `Failed to update club with id ${id}`,
        } satisfies APIResponse);
      }

      return {
        message: `Club with id ${id} updated`,
        data: res[0],
      } satisfies APIResponse;
    },
    { body: InsertClubSchema }
  );
  app.delete("/:id", async ({ params: { id }, error }) => {
    const res = await db
      .delete(clubs)
      .where(eq(clubs.id, parseInt(id)))
      .returning();

    if (res.length == 0) {
      return {
        error: `Failed to delete club with id ${id}`,
      } satisfies APIResponse;
    }

    return {
      message: `Club with id ${id} deleted`,
      data: res[0],
    } satisfies APIResponse;
  });
  return app;
}
