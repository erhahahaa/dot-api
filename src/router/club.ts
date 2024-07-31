import { and, eq } from "drizzle-orm";
import { t } from "elysia";
import { GET_CLUB_QUERY_WITH } from "~/helper/query";
import { db } from "~/lib";
import { clubs, InsertClubSchema } from "~/schemas/clubs";
import { medias } from "~/schemas/media";
import { UserType } from "~/schemas/users";
import { usersToClubs } from "~/schemas/users/relations";
import { APIResponse } from "~/types";
import { deleteFile, uploadFile } from "~/utils";
import { ServerType } from "..";

const TABLE_KEY = "club";

export function createClubRouter(app: ServerType) {
  app.get(
    "/",
    async ({ query: { cursor = "0", limit = "10" }, error, jwt, bearer }) => {
      const user = await jwt.verify(bearer);
      if (!user || !user.id) {
        return error(401, { error: "Unauthorized" } satisfies APIResponse);
      }

      const userClubs = await db.query.usersToClubs.findMany({
        where(fields, op) {
          return op.eq(fields.userId, parseInt(user.id as string));
        },
        columns: { clubId: true },
      });

      if (userClubs.length == 0) {
        return error(404, {
          error: "No joined clubs found",
        } satisfies APIResponse);
      }

      const res = await db.query.clubs.findMany({
        with: GET_CLUB_QUERY_WITH,
        where(fields, { inArray, gt, and }) {
          return and(
            gt(fields.id, parseInt(cursor)),
            inArray(
              fields.id,
              userClubs.map((c) => c.clubId)
            )
          );
        },
        limit: parseInt(limit),
      });

      if (res.length == 0) {
        return error(404, {
          error: "No clubs found",
        } satisfies APIResponse);
      }

      for (const club of res as any) {
        club.memberCount = club.membersPivot.length;
        club.programCount = club.programs.length;
        club.examCount = club.exams.length;
        club.tacticalCount = club.tacticals.length;
        delete club.membersPivot;
        delete club.programs;
        delete club.exams;
        delete club.tacticals;
      }

      return {
        message: "Clubs found",
        data: res,
      } satisfies APIResponse;
    }
  );
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

      console.log("Incoming body\n", body);

      body.creatorId = user.id as string;

      if (body.image) {
        const upload = await uploadFile({
          creatorId: body.creatorId,
          parent: TABLE_KEY,
          blob: body.image as Blob,
        });
        if (upload.error) {
          return error(500, {
            error: `Failed to upload image`,
            message:
              upload.error instanceof Error
                ? upload.error.message
                : upload.error,
          } satisfies APIResponse);
        }

        if (upload.result) {
          body.mediaId = upload.result.id;
        }
      }

      const club = await db
        .insert(clubs)
        .values({
          ...body,
          creatorId: parseInt(body.creatorId),
        })
        .returning({ id: clubs.id });

      const res: any = await db.query.clubs.findFirst({
        with: GET_CLUB_QUERY_WITH,
        where(fields, { eq }) {
          return eq(fields.id, club[0].id);
        },
      });
      if (!res) {
        return error(500, {
          error: `Failed to insert club`,
        } satisfies APIResponse);
      }

      res.memberCount = res.membersPivot.length;
      res.programCount = res.programs.length;
      res.examCount = res.exams.length;
      res.tacticalCount = res.tacticals.length;
      delete res.membersPivot;
      delete res.programs;
      delete res.exams;
      delete res.tacticals;

      await db.insert(usersToClubs).values({
        role: "coach",
        clubId: res.id,
        userId: parseInt(body.creatorId),
      });

      await db
        .update(medias)
        .set({
          clubId: res.id,
        })
        .where(eq(medias.id, res.mediaId));

      return {
        message: "Club inserted",
        data: res,
      } satisfies APIResponse;
    },
    {
      body: t.Composite([
        InsertClubSchema,
        t.Partial(
          t.Object({
            image: t.Any(),
          })
        ),
      ]),
      type: "multipart/form-data",
    }
  );
  app.put(
    "/:id",
    async ({ params: { id }, body, error, jwt, bearer }) => {
      const user = await jwt.verify(bearer);
      if (!user || !user.id) {
        return error(401, { error: "Unauthorized" } satisfies APIResponse);
      }
      const old = await db.query.clubs.findFirst({
        where(fields, op) {
          return op.eq(fields.id, parseInt(id));
        },
        columns: {
          creatorId: true,
          mediaId: true,
        },
        with: {
          media: {
            columns: {
              name: true,
              path: true,
            },
          },
        },
      });
      if (!old) {
        return error(404, {
          error: `Club with id ${id} not found`,
        } satisfies APIResponse);
      }

      body.creatorId = old.creatorId;
      body.mediaId = old.mediaId;

      if (body.image) {
        const upload = await uploadFile({
          creatorId: user.id as string,
          parent: TABLE_KEY,
          blob: body.image as Blob,
          mediaId: old.mediaId,
        });
        if (upload.error) {
          return error(500, {
            error: `Failed to upload image`,
            message:
              upload.error instanceof Error
                ? upload.error.message
                : upload.error,
          } satisfies APIResponse);
        }

        if (upload.result) {
          body.mediaId = upload.result.id;
          const img = old.media;
          if (img && img.path) {
            await deleteFile({
              fileName: [img.name],
              path: img.path,
              parent: "club",
            });
          }
        }
      }

      const club = await db
        .update(clubs)
        .set({
          ...body,
          creatorId: body.creatorId,
        })
        .where(eq(clubs.id, parseInt(id)))
        .returning();

      if (club.length == 0) {
        return error(500, {
          error: `Failed to update club with id ${id}`,
        } satisfies APIResponse);
      }
      const res: any = await db.query.clubs.findFirst({
        with: GET_CLUB_QUERY_WITH,
        where(fields, { eq }) {
          return eq(fields.id, club[0].id);
        },
      });

      res.memberCount = res.membersPivot.length;
      res.programCount = res.programs.length;
      res.examCount = res.exams.length;
      res.tacticalCount = res.tacticals.length;
      delete res.membersPivot;
      delete res.programs;
      delete res.exams;
      delete res.tacticals;

      if (!res) {
        return error(500, {
          error: `Failed to update club with id ${id}`,
        } satisfies APIResponse);
      }

      await db
        .update(medias)
        .set({
          clubId: res.id,
        })
        .where(eq(medias.id, res.mediaId));

      return {
        message: `Club with id ${id} updated`,
        data: res,
      } satisfies APIResponse;
    },
    {
      body: t.Composite([
        InsertClubSchema,
        t.Partial(
          t.Object({
            image: t.Any(),
          })
        ),
      ]),
      type: "multipart/form-data",
    }
  );
  app.delete("/:id", async ({ params: { id }, error }) => {
    const relation = await db
      .select()
      .from(usersToClubs)
      .where(eq(usersToClubs.clubId, parseInt(id)));
    if (relation.length > 0) {
      return error(500, {
        error: `Club with id ${id} has members`,
      } satisfies APIResponse);
    }

    const club = await db
      .select()
      .from(clubs)
      .where(eq(clubs.id, parseInt(id)))
      .limit(1);

    if (club.length == 0) {
      return error(404, {
        error: `Club with id ${id} not found`,
      } satisfies APIResponse);
    }

    if (club[0].mediaId) {
      const media = await db
        .select()
        .from(medias)
        .where(eq(medias.id, club[0].mediaId))
        .limit(1);
      if (media.length > 0 && media[0].path) {
        await deleteFile({
          fileName: [media[0].name],
          path: media[0].path,
          parent: TABLE_KEY,
        });
      }
    }

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
  app.get(
    "/:id/members",
    async ({ params: { id }, query: { limit = "10" }, error }) => {
      const res = await db.query.usersToClubs.findMany({
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
            },
          },
        },
        where(fields, { eq }) {
          return eq(fields.clubId, parseInt(id));
        },
        limit: parseInt(limit),
      });

      if (res.length == 0) {
        return error(404, {
          error: `No members found for club with id ${id}`,
        } satisfies APIResponse);
      }

      let members: UserType[] = [];
      for (const member of res) {
        if (members.find((m) => m.id === member.user.id)) {
          continue;
        }
        member.user.role = member.role;
        members.push(member.user as any);
      }

      return {
        message: `Members found for club with id ${id}`,
        data: members,
      } satisfies APIResponse;
    }
  );

  return createClubActionRouter(app);
}

function createClubActionRouter(app: ServerType) {
  app.get(
    "/:id/add/:userId",
    async ({ params: { id, userId }, error, jwt, bearer }) => {
      const user = await jwt.verify(bearer);
      if (!user || !user.id) {
        return error(401, { error: "Unauthorized" } satisfies APIResponse);
      }

      const find = await db.query.usersToClubs.findFirst({
        where(fields, { eq, and }) {
          return and(
            eq(fields.userId, parseInt(userId)),
            eq(fields.clubId, parseInt(id))
          );
        },
      });

      if (!find) {
        return error(404, {
          error: `User with id ${userId} not found in club with id ${id}`,
        } satisfies APIResponse);
      }

      const res = await db
        .insert(usersToClubs)
        .values({
          role: "athlete",
          clubId: parseInt(id),
          userId: parseInt(userId),
        })
        .returning();

      if (res.length == 0) {
        return error(500, {
          error: `Failed to add user with id ${userId} to club with id ${id}`,
        } satisfies APIResponse);
      }

      return {
        message: `User with id ${userId} added to club with id ${id}`,
        data: res[0],
      } satisfies APIResponse;
    }
  );

  app
    .get("/:id/join", async ({ params: { id }, jwt, bearer, error }) => {
      const user = await jwt.verify(bearer);
      if (!user || !user.id) {
        return error(401, { error: "Unauthorized" } satisfies APIResponse);
      }

      const relation = await db.query.usersToClubs.findFirst({
        where(fields, { eq, and }) {
          return and(
            eq(fields.userId, parseInt(user.id as string)),
            eq(fields.clubId, parseInt(id))
          );
        },
      });

      if (relation) {
        return error(500, {
          error: `User already joined club with id ${id}`,
        } satisfies APIResponse);
      }

      const res = await db
        .insert(usersToClubs)
        .values({
          role: "athlete",
          clubId: parseInt(id),
          userId: parseInt(user.id as string),
        })
        .returning();

      if (res.length == 0) {
        return error(500, {
          error: `Failed to join club with id ${id}`,
        } satisfies APIResponse);
      }

      return {
        message: `User joined club with id ${id}`,
        data: res[0],
      } satisfies APIResponse;
    })
    .get("/:id/leave", async ({ params: { id }, jwt, bearer, error }) => {
      const user = await jwt.verify(bearer);
      if (!user || !user.id) {
        return error(401, { error: "Unauthorized" } satisfies APIResponse);
      }

      const deleted = await db
        .delete(usersToClubs)
        .where(
          and(
            eq(usersToClubs.userId, parseInt(user.id as string)),
            eq(usersToClubs.clubId, parseInt(id))
          )
        )
        .returning();

      if (deleted.length == 0) {
        return error(500, {
          error: `Failed to leave club with id ${id}`,
        } satisfies APIResponse);
      }

      const res = await db.query.clubs.findFirst({
        with: GET_CLUB_QUERY_WITH,
        where(fields, { eq }) {
          return eq(fields.id, parseInt(id));
        },
      });

      const members = await db.query.usersToClubs.findMany({
        where(fields, { eq }) {
          return eq(fields.clubId, parseInt(id));
        },
      });

      if (members.length == 0) {
        await db.delete(clubs).where(eq(clubs.id, parseInt(id)));
      }

      return {
        message: `User left club with id ${id}`,
        data: res,
      } satisfies APIResponse;
    });

  app.get(
    "/:id/kick/:userId",
    async ({ params: { id, userId }, error, jwt, bearer }) => {
      const user = await jwt.verify(bearer);
      if (!user || !user.id) {
        return error(401, { error: "Unauthorized" } satisfies APIResponse);
      }

      const verify = await db.query.usersToClubs.findFirst({
        where(fields, { eq, and }) {
          return and(
            eq(fields.userId, parseInt(user.id as string)),
            eq(fields.clubId, parseInt(id)),
            eq(fields.role, "coach")
          );
        },
      });

      if (!verify) {
        return error(401, {
          error: "Unauthorized",
        } satisfies APIResponse);
      }

      const lastCoach = await db.query.usersToClubs.findMany({
        where(fields, { eq, and }) {
          return and(eq(fields.clubId, parseInt(id)), eq(fields.role, "coach"));
        },
      });

      if (lastCoach.length == 1) {
        return error(500, {
          error: "Cannot kick last coach",
        } satisfies APIResponse);
      }

      const res = await db
        .delete(usersToClubs)
        .where(
          and(
            eq(usersToClubs.userId, parseInt(userId)),
            eq(usersToClubs.clubId, parseInt(id))
          )
        )
        .returning();

      if (res.length == 0) {
        return error(500, {
          error: `Failed to kick user with id ${userId}`,
        } satisfies APIResponse);
      }

      return {
        message: `User with id ${userId} kicked from club with id ${id}`,
        data: res[0],
      } satisfies APIResponse;
    }
  );

  return app;
}
