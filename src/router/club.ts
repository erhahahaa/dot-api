import { and, eq, gt } from "drizzle-orm";
import { db } from "~/db";
import { clubs, InsertClubSchema } from "~/schemas/clubs";
import { usersToClubs } from "~/schemas/users/relations";
import { APIResponse } from "~/types";
import { ServerType } from "..";

export function createClubRouter(app: ServerType) {
  app.get("/", async ({ query: { cursor, limit, creator_id }, error }) => {
    const res = await db
      .select()
      .from(clubs)
      .where(
        creator_id
          ? and(
              gt(clubs.id, parseInt(cursor as string) || 0),
              eq(clubs.creatorId, parseInt(creator_id as string) || 0)
            )
          : gt(clubs.id, parseInt(cursor as string) || 0)
      )
      .limit(parseInt(limit as string) || 10);

    if (res.length == 0) {
      return error(404, {
        error: "No clubs found",
      } satisfies APIResponse);
    }

    for (const club of res as any) {
      const memberCount = await db
        .select()
        .from(usersToClubs)
        .where(eq(usersToClubs.clubId, club.id));
      club.memberCount = memberCount.length;
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
    async ({ body, error, jwt, bearer }) => {
      const user = await jwt.verify(bearer);
      if (!user || !user.id) {
        return error(401, { error: "Unauthorized" } satisfies APIResponse);
      }
      body.creatorId = parseInt(user.id as string);

      const res = await db.insert(clubs).values(body).returning();
      if (res.length == 0) {
        return error(500, {
          error: `Failed to insert club`,
        } satisfies APIResponse);
      }

      await db.insert(usersToClubs).values({
        role: "coach",
        clubId: res[0].id,
        userId: body.creatorId,
      });

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
    async ({ params: { id }, body, error, jwt, bearer }) => {
      const user = await jwt.verify(bearer);
      if (!user || !user.id) {
        return error(401, { error: "Unauthorized" } satisfies APIResponse);
      }
      body.creatorId = parseInt(user.id as string);
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
      return error(500, {
        error: `Failed to delete club with id ${id}`,
      } satisfies APIResponse);
    }

    return {
      message: `Club with id ${id} deleted`,
      data: res[0],
    } satisfies APIResponse;
  });
  return app;
}
