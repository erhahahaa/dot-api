import { eq } from "drizzle-orm";
import { db } from "~/lib";
import { InsertTacticalSchema, tacticals } from "~/schemas/clubs/tacticals";

import { MEDIA_QUERY_WITH } from "~/helper/query";
import { APIResponse } from "~/types";
import { ServerType } from "../..";

export function createTacticalRouter(app: ServerType) {
  app.get(
    "/",
    async ({ query: { cursor = "0", limit = "10", clubId = "0" }, error }) => {
      const res = await db.query.tacticals.findMany({
        where(fields, { gt, and, eq }) {
          return and(
            gt(fields.id, parseInt(cursor)),
            eq(fields.clubId, parseInt(clubId))
          );
        },
        limit: parseInt(limit),
        with: {
          media: {
            columns: MEDIA_QUERY_WITH,
          },
        },
      });

      if (res.length == 0) {
        return error(404, {
          error: "No tacticals found",
        } satisfies APIResponse);
      }

      for (const program of res as any) {
        program.media = program.image;
        delete program.image;
      }

      return {
        message: "Tacticals found",
        data: res,
      } satisfies APIResponse;
    }
  );
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
      console.log("BODY", body);
      const { clubId } = body;
      if (!clubId) {
        return error(400, {
          error: "clubId is required",
        } satisfies APIResponse);
      }

      const find = await db.query.clubs.findFirst({
        where(fields, { eq }) {
          return eq(fields.id, clubId);
        },
      });

      if (!find) {
        return error(404, {
          error: `Club with id ${clubId} not found`,
        } satisfies APIResponse);
      }

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
      const { clubId } = body;
      if (!clubId) {
        return error(400, {
          error: "clubId is required",
        } satisfies APIResponse);
      }

      const find = await db.query.clubs.findFirst({
        where(fields, { eq }) {
          return eq(fields.id, clubId);
        },
      });

      if (!find) {
        return error(404, {
          error: `Club with id ${clubId} not found`,
        } satisfies APIResponse);
      }

      const res = await db
        .update(tacticals)
        .set({ ...body, updatedAt: new Date() })
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
