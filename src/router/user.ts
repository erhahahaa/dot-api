import { and, eq } from "drizzle-orm";
import { t } from "elysia";
import { db } from "~/lib";
import { InsertUserSchema, users } from "~/schemas/users";
import { APIResponse } from "~/types";
import { sanitize } from "~/utils";
import { encryptPassword } from "~/utils/password";
import { uploadSBFile } from "~/utils/uploader";
import { generateFromEmail } from "~/utils/user";
import { ServerType } from "..";

export function createUserRouter(app: ServerType) {
  app.put(
    "/update",
    async ({ body, error, jwt, bearer }) => {
      const verify = await jwt.verify(bearer);
      if (!verify) {
        return error(401, {
          error: "Unauthorized",
        } satisfies APIResponse);
      }

      const { password, bornDate, updatedAt, ...rest } = body;

      const hash = await encryptPassword(password);

      const user = await db
        .update(users)
        .set({
          ...rest,
          password: hash,
          bornDate: new Date((bornDate as string) || new Date()),
          updatedAt: new Date(),
        })
        .where(
          and(eq(users.id, verify.id as number), eq(users.email, body.email))
        )
        .returning();

      if (user.length === 0) {
        return error(404, {
          error: "Failed to update user",
        } satisfies APIResponse);
      }

      return {
        message: "User updated",
        data: {
          ...sanitize(user[0], ["password"]),
        },
      } satisfies APIResponse;
    },
    {
      body: InsertUserSchema,
    }
  );

  app.put(
    "/update-photo",
    async ({ body, error, jwt, bearer }) => {
      const verify = await jwt.verify(bearer);
      if (!verify) {
        return error(401, {
          error: "Unauthorized",
        } satisfies APIResponse);
      }

      if (body.image.size == 0) {
        return error(400, {
          error: "File size is 0",
        });
      }

      const upload = await uploadSBFile({
        parent: "user",
        blob: body.image,
      });

      if (upload.error || !upload.result) {
        return error(500, {
          error: "Failed to update image",
        });
      }

      const user = await db
        .update(users)
        .set({
          image: upload.result.url,
          updatedAt: new Date(),
        })
        .where(eq(users.id, verify.id as number))
        .returning();

      if (user.length === 0) {
        return error(404, {
          error: "Failed to update user photo",
        } satisfies APIResponse);
      }

      return {
        message: "User photo updated",
        data: {
          ...sanitize(user[0], ["password"]),
        },
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
  app.get("/search", async ({ query: { query }, error }) => {
    console.log("query", query);
    if (!query || query.length === 0) {
      const random = await db.query.users.findMany();

      return {
        message: "Random user found",
        data: random,
      } satisfies APIResponse;
    }

    const find = await db.query.users.findMany({
      where(fields, { ilike, or }) {
        return or(
          ilike(fields.name, `%${query}%`),
          ilike(fields.username, `%${query}%`)
        );
      },
      columns: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        phone: true,
        role: true,
        expertise: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: "User found",
      data: find,
    } satisfies APIResponse;
  });

  app.get("find-username", async ({ query: { username, email }, error }) => {
    if (!username) {
      return error(400, {
        error: "Username is required",
      } satisfies APIResponse);
    }

    if (!email) {
      email = `${username}@gmail.com:`;
    }

    const user = await db.query.users.findFirst({
      where: (fields, { eq }) => eq(fields.username, username),
      columns: { id: true },
    });

    if (!user) {
      return {
        message: "Username available",
      } satisfies APIResponse;
    }

    const suggestions = Array.from({ length: 5 }, (_, i) =>
      generateFromEmail(email, i + 1)
    );

    const existingUsers = await db.query.users.findMany({
      where: (fields, { inArray }) => inArray(fields.username, suggestions),
      columns: { username: true },
    });

    const existingUsernames = new Set(existingUsers.map((u) => u.username));

    const finalSuggestions = suggestions.map((suggestion, i) => {
      while (existingUsernames.has(suggestion)) {
        suggestion = generateFromEmail(email, i + 55555);
      }
      return suggestion;
    });

    return {
      message: "Username not available",
      data: finalSuggestions,
    } satisfies APIResponse;
  });

  return app;
}
