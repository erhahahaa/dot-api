import { eq } from "drizzle-orm";
import { t } from "elysia";
import { Message } from "firebase-admin/messaging";
import { MEDIA_QUERY_WITH } from "~/helper/query";
import { db } from "~/lib";
import { InsertProgramSchema, programs } from "~/schemas/clubs/programs";
import { APIResponse } from "~/types";
import { uploadFile } from "~/utils";
import { ServerType } from "..";

export function createProgramRouter(app: ServerType) {
  app.get(
    "/",
    async ({ query: { cursor = "0", limit = "10", clubId }, error }) => {
      if (!clubId) {
        return error(400, {
          error: "Club id is required",
        } satisfies APIResponse);
      }

      const find = await db.query.clubs.findFirst({
        where(fields, { eq }) {
          return eq(fields.id, parseInt(clubId));
        },
      });

      if (!find) {
        return error(404, {
          error: `Club with id ${clubId} not found`,
        } satisfies APIResponse);
      }

      const res = await db.query.programs.findMany({
        where(fields, { eq, gt, and }) {
          return and(
            gt(fields.id, parseInt(cursor || "0")),
            eq(fields.clubId, parseInt(clubId || "0"))
          );
        },
        with: {
          media: {
            columns: MEDIA_QUERY_WITH,
          },
        },
        limit: parseInt(limit),
      });

      if (res.length == 0) {
        return error(404, {
          error: "No programs found",
        } satisfies APIResponse);
      }

      return {
        message: "Programs found",
        data: res,
      } satisfies APIResponse;
    }
  );
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

    for (const program of res as any) {
      program.media = program.image;
      delete program.image;
    }

    return {
      message: `Program with id ${id} found`,
      data: res[0],
    } satisfies APIResponse;
  });
  app.post(
    "/",
    async ({ body, error }) => {
      const { clubId } = body;
      if (!clubId) {
        return error(400, {
          error: "Club id is required",
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
        .insert(programs)
        .values({
          ...body,
          endDate: new Date(body.endDate || new Date()),
          startDate: new Date(body.startDate || new Date()),
        })
        .returning();
      if (res.length == 0) {
        return error(500, {
          error: `Failed to create ${body.name} program`,
        } satisfies APIResponse);
      }
      const msg: Message = {
        notification: {
          title: "Program Created",
          body: `Program with id ${res[0].id} created`,
        },
        data: {
          programId: res[0].id.toString(),
          name: res[0].name,
        },
        android: {
          priority: "high",
          notification: {
            sound: "default",
            title: "Program Created",
            body: `Program with id ${res[0].id} created`,
          },
        },
        topic: `all`,
      };

      // const send = await getMessaging(fbApp).send(msg);

      // console.log("SEND", send);

      return {
        message: "Program created",
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
      try {
        const { clubId } = body;
        if (!clubId) {
          return error(400, {
            error: "Club id is required",
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
          .update(programs)
          .set({
            ...body,
            endDate: new Date(body.endDate || new Date()),
            startDate: new Date(body.startDate || new Date()),
            updatedAt: new Date(),
          })
          .where(eq(programs.id, parseInt(id)))
          .returning();

        if (res.length == 0) {
          return error(500, {
            error: `Failed to update program with id ${id}`,
          } satisfies APIResponse);
        }

        // const send = await getMessaging().send({
        //   notification: {
        //     title: "Program Updated",
        //     body: `Program with id ${id} updated`,
        //   },
        //   topic: `program-${id}`,
        // });

        // console.log("SEND", send);

        return {
          message: `Program with id ${id} updated`,
          data: res[0],
        } satisfies APIResponse;
      } catch (err) {
        console.log("ERROR", err);
        return error(500, {
          error: `Failed to update program with id ${id}`,
        } satisfies APIResponse);
      }
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

  app.put(
    "/:id/image",
    async ({ params: { id }, body, error, jwt, bearer }) => {
      const verify = await jwt.verify(bearer);
      if (!verify) {
        return error(401, {
          error: "Unauthorized",
        } satisfies APIResponse);
      }
      const program = await db.query.programs.findFirst({
        where(fields, { eq }) {
          return eq(fields.id, parseInt(id));
        },
      });

      if (!program || !program.clubId) {
        return error(404, {
          error: `Program with id ${id} not found`,
        } satisfies APIResponse);
      }

      const upload = await uploadFile({
        creatorId: verify.id.toString(),
        parent: "program",
        blob: body.image,
        clubId: program.clubId,
      });

      if (upload.error || !upload.result) {
        return error(500, {
          error: "Failed to update image",
        });
      }
      console.log("RESULT", upload.result);
      const res = await db
        .update(programs)
        .set({
          mediaId: upload.result.id,
        })
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
    {
      body: t.Object({
        image: t.File({
          maxSize: 100 * 1024 * 1024, // 100MB
        }),
      }),
      type: "multipart/form-data",
    }
  );

  return app;
}
