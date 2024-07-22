import { eq } from "drizzle-orm";
import { t } from "elysia";
import { db } from "~/lib";
import { InsertMediaSchema, medias } from "~/schemas/media";
import { APIResponse } from "~/types";
import { deleteSBFile, uploadSBFile } from "~/utils/uploader";
import { ServerType } from "..";

export function createMediaRouter(app: ServerType) {
  app.get(
    "/:dir",
    async ({
      error,
      params: { dir },
      query: { cursor = "0", limit = "20", clubId = "0" },
    }) => {
      const res = await db.query.medias.findMany({
        // columns: MEDIA_QUERY_WITH,
        where(fields, { eq, and, gt }) {
          return and(eq(fields.parent, dir), gt(fields.id, parseInt(cursor)));
        },
        limit: parseInt(limit),
      });

      if (res.length == 0) {
        return error(404, { error: "Media empty" } satisfies APIResponse);
      }

      return {
        message: "Media list",
        data: res,
      } satisfies APIResponse;
    },
    {
      params: t.Object({
        dir: InsertMediaSchema.properties.parent,
      }),
    }
  );
  app.post(
    "/:dir",
    async ({
      body,
      error,
      jwt,
      bearer,
      params: { dir },
      query: { clubId = "0" },
    }) => {
      const user = await jwt.verify(bearer);
      if (!user || !user.id) {
        return error(401, { error: "Unauthorized" } satisfies APIResponse);
      }
      if (body.file.type.length == 0) {
        body.file = new File([body.file], body.file.name, {
          type: "application/octet-stream",
        });
      }

      const upload = await uploadSBFile({
        parent: dir,
        blob: body.file,
      });

      if (upload.error || !upload.result) {
        return error(500, {
          error: "Failed to upload image",
        });
      }

      const res = await db
        .insert(medias)
        .values({
          creatorId: user.id as number,
          name: body.file.name,
          fileSize: body.file.size,
          path: upload.result.path,
          type: body.file.type as typeof InsertMediaSchema.properties.type.type,
          parent: dir,
          url: upload.result.url,
        })
        .returning();

      if (res.length == 0) {
        return error(500, {
          error: "Failed to insert media into database",
        });
      }

      return {
        message: "Media uploaded",
        data: res[0],
      } satisfies APIResponse;
    },
    {
      body: t.Object({
        file: t.File({
          maxSize: 100 * 1024 * 1024, // 100MB
        }),
      }),
      params: t.Object({
        dir: InsertMediaSchema.properties.parent,
      }),
      type: "multipart/form-data",
    }
  );
  app.put(
    "/:dir/:id",
    async ({ body, error, jwt, bearer, params: { id, dir } }) => {
      const user = await jwt.verify(bearer);
      if (!user || !user.id) {
        return error(401, { error: "Unauthorized" } satisfies APIResponse);
      }
      if (body.file.type.length == 0) {
        body.file = new File([body.file], body.file.name, {
          type: "application/octet-stream",
        });
      }

      const find = await db.query.medias.findFirst({
        where(fields, { eq }) {
          return eq(fields.id, parseInt(id));
        },
      });

      if (!find) {
        return error(404, {
          error: "Media not found",
        });
      }

      const upload = await uploadSBFile({
        parent: dir,
        blob: body.file,
      });
      if (upload.error || !upload.result) {
        return error(500, {
          error: "Failed to update image",
        });
      }

      if (find.path) {
        await deleteSBFile({
          path: find.path,
          parent: find.parent,
        });
      }

      const res = await db
        .update(medias)
        .set({
          creatorId: find.creatorId,
          name: body.file.name,
          fileSize: body.file.size,
          path: upload.result.path,
          type: body.file.type as typeof InsertMediaSchema.properties.type.type,
          parent: dir,
          url: upload.result.url,
        })
        .where(eq(medias.id, parseInt(id)))
        .returning();

      if (res.length == 0) {
        return error(500, {
          error: `Failed to update media with id ${id}`,
        });
      }

      return {
        message: `Media with id ${id} updated`,
        data: res[0],
      } satisfies APIResponse;
    },
    {
      body: t.Object({
        file: t.File({
          maxSize: 100 * 1024 * 1024, // 100MB
        }),
      }),
      params: t.Object({
        dir: InsertMediaSchema.properties.parent,
        id: t.String(),
      }),
      type: "multipart/form-data",
    }
  );

  return app;
}
