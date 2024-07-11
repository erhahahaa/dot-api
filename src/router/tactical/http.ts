import { eq, gt } from "drizzle-orm";
import { db } from "~/db";
import { InsertTacticalSchema, tacticals } from "~/schemas/clubs/tacticals";
import { APIResponse } from "~/types";
import { ServerType } from "../..";

export function createTacticalRouter(app: ServerType) {
  app.get("/", async ({ query: { cursor, limit }, error }) => {
    const res = await db
      .select()
      .from(tacticals)
      .where(gt(tacticals.id, parseInt(cursor as string) || 0))
      .limit(parseInt(limit as string) || 10);

    if (res.length == 0) {
      return error(404, {
        error: "No tacticals found",
      } satisfies APIResponse);
    }
    return {
      message: "Tacticals found",
      data: res,
    } satisfies APIResponse;
  });
  app.get("/:id", async ({ params: { id }, error }) => {
    const res = await db
      .select()
      .from(tacticals)
      .where(eq(tacticals.id, parseInt(id)))
      .limit(1);

    if (res.length == 0) {
      return error(404, {
        error: `Tactical with id ${id} not found`,
      } satisfies APIResponse);
    }

    return {
      message: `Tactical with id ${id} found`,
      data: res[0],
    } satisfies APIResponse;
  });
  app.post(
    "/",
    async ({ body, error }) => {
      const res = await db.insert(tacticals).values(body).returning();
      if (res.length == 0) {
        return error(500, {
          error: "Failed to insert tactical",
        } satisfies APIResponse);
      }

      return {
        message: "Tactical inserted",
        data: res[0],
      } satisfies APIResponse;
    },
    {
      body: InsertTacticalSchema,
    }
  );
  app.put(
    "/:id",
    async ({ params: { id }, body, error }) => {
      const res = await db
        .update(tacticals)
        .set(body)
        .where(eq(tacticals.id, parseInt(id)))
        .returning();

      if (res.length == 0) {
        return error(500, {
          error: `Failed to update tactical with id ${id}`,
        } satisfies APIResponse);
      }

      return {
        message: `Tactical with id ${id} updated`,
        data: res[0],
      } satisfies APIResponse;
    },
    { body: InsertTacticalSchema }
  );
  app.delete("/:id", async ({ params: { id }, error }) => {
    const res = await db
      .delete(tacticals)
      .where(eq(tacticals.id, parseInt(id)))
      .returning();

    if (res.length == 0) {
      return error(500, {
        error: `Failed to delete tactical with id ${id}`,
      } satisfies APIResponse);
    }

    return {
      message: `Tactical with id ${id} deleted`,
      data: res[0],
    } satisfies APIResponse;
  });

  return app;
}
