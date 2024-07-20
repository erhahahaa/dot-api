import { eq } from "drizzle-orm";
import { t } from "elysia";
import { db } from "~/lib";
import { clubs, InsertClubSchema } from "~/schemas/clubs";
import { medias } from "~/schemas/media";
import { usersToClubs } from "~/schemas/users/relations";
import { APIResponse } from "~/types";
import { deleteFile, uploadFile } from "~/utils";
import { ServerType } from "..";

const TABLE_KEY = "club";

export function createClubRouter(app: ServerType) {
  app.get(
    "/",
    async ({ query: { cursor = "0", limit = "10", creator_id }, error }) => {
      const res = await db.query.clubs.findMany({
        with: {
          image: {
            columns: { url: true },
          },
          membersPivot: {
            columns: { userId: true },
          },
        },

        where(fields, op) {
          if (creator_id) {
            return op.and(
              op.gt(fields.id, parseInt(cursor)),
              op.eq(fields.creatorId, parseInt(creator_id))
            );
          } else {
            return op.gt(fields.id, parseInt(cursor));
          }
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
        delete club.membersPivot;
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
          body.imageId = upload.result.id;
        }
      }

      const res = await db
        .insert(clubs)
        .values({
          ...body,
          creatorId: parseInt(body.creatorId),
        })
        .returning();
      if (res.length == 0) {
        return error(500, {
          error: `Failed to insert club`,
        } satisfies APIResponse);
      }

      await db.insert(usersToClubs).values({
        role: "coach",
        clubId: res[0].id,
        userId: parseInt(body.creatorId),
      });

      return {
        message: "Club inserted",
        data: res[0],
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
          imageId: true,
        },
        with: {
          image: {
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
      body.imageId = old.imageId;

      if (body.image) {
        const upload = await uploadFile({
          creatorId: user.id as string,
          parent: TABLE_KEY,
          blob: body.image as Blob,
          mediaId: old.imageId,
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
          body.imageId = upload.result.id;
          const img = old.image;
          if (img && img.path) {
            await deleteFile({
              fileName: [img.name],
              path: img.path,
              parent: "club",
            });
          }
        }
      }

      const res = await db
        .update(clubs)
        .set({
          ...body,
          creatorId: body.creatorId,
        })
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

    if (club[0].imageId) {
      const image = await db
        .select()
        .from(medias)
        .where(eq(medias.id, club[0].imageId))
        .limit(1);
      if (image.length > 0 && image[0].path) {
        await deleteFile({
          fileName: [image[0].name],
          path: image[0].path,
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
  return app;
}
