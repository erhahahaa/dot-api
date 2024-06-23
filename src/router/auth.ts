import { eq } from "drizzle-orm";
import { t } from "elysia";
import { db } from "~/db";
import { authMiddleware } from "~/middleware";
import { InsertUserSchema, users } from "~/schemas/users";
import { rotateJWT } from "~/utils/jwt";
import { encryptPassword, sanitize } from "~/utils/password";
import { ServerType } from "..";

export function createAuthRouter(app: ServerType) {
  app.post(
    "/sign-in",
    async ({ jwt, cookie: { auth }, body }) => {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, body.email));

      if (user.length == 0) {
        return {
          error: `User with email ${body.email} not found`,
        };
      }
      const token = rotateJWT(jwt, auth, user[0]);

      return {
        ...sanitize(user[0], ["password"]),
        token,
      };
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    }
  );
  app.post(
    "/sign-up",
    async ({ body }) => {
      const { password, ...rest } = body;
      const hash = await encryptPassword(password);

      const user = await db
        .insert(users)
        .values({
          ...rest,
          password: hash,
        })
        .returning();

      if (user.length == 0) {
        return {
          error: `Failed sign up ${rest.name}`,
        };
      }
      return sanitize(user[0], ["password"]);
    },
    { body: InsertUserSchema }
  );

  app
    .onBeforeHandle(authMiddleware)
    .get("/me/:id", async ({ jwt, cookie: { auth }, params: { id } }) => {
      const found = await db
        .select()
        .from(users)
        .where(eq(users.id, parseInt(id)));

      if (found.length == 0) {
        return {
          error: "User not found",
        };
      }
      const token = await rotateJWT(jwt, auth, found[0]);
      return {
        ...sanitize(found[0], ["password"]),
        token,
      };
    });

  app
    .onBeforeHandle(authMiddleware)
    .get("/logout", async ({ jwt, cookie: { auth } }) => {
      auth.set({
        value: "",
        maxAge: 0,
      });
      return {
        message: "Logout success",
      };
    });

  return app;
}
