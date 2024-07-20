import { eq } from "drizzle-orm";
import { t } from "elysia";
import { db } from "~/lib";
import { authMiddleware } from "~/middleware";
import { InsertUserSchema, users } from "~/schemas/users";
import { APIResponse } from "~/types";
import { sanitize } from "~/utils";
import { rotateJWT } from "~/utils/jwt";
import { encryptPassword } from "~/utils/password";
import { ServerType } from "..";

export function createAuthRouter(app: ServerType) {
  app.post(
    "/sign-in",
    async ({ jwt, cookie: { auth }, body, error }) => {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, body.email));

      if (user.length == 0) {
        return error(404, {
          error: `User with email ${body.email} not found`,
        } satisfies APIResponse);
      }
      const token = await rotateJWT(jwt, auth, user[0]);

      return {
        message: "Sign in success, welcome back!",
        data: {
          ...sanitize(user[0], ["password"]),
          token,
        },
      } satisfies APIResponse;
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
    async ({ body, error }) => {
      const { password, ...rest } = body;
      const find = await db.query.users.findFirst({
        where(fields, { eq }) {
          return eq(fields.email, rest.email);
        },
      });

      if (find) {
        return error(409, {
          error: `Email signed up`,
          message: `Email ${rest.email} already signed up, please sign in`,
        } satisfies APIResponse);
      }

      const hash = await encryptPassword(password);

      const user = await db
        .insert(users)
        .values({
          ...rest,
          password: hash,
        })
        .onConflictDoNothing()
        .returning();

      if (user.length == 0) {
        return error(500, {
          error: `Failed to sign up ${rest.name}`,
        } satisfies APIResponse);
      }

      return {
        message: "Sign up success, welcome!",
        data: {
          ...sanitize(user[0], ["password"]),
        },
      } satisfies APIResponse;
    },
    { body: InsertUserSchema }
  );

  app
    .onBeforeHandle(authMiddleware)
    .get("/me", async ({ jwt, bearer, cookie: { auth }, error }) => {
      const valid = (await jwt.verify(bearer)) as { id: string };
      const found = await db
        .select()
        .from(users)
        .where(eq(users.id, parseInt(valid.id)));

      if (found.length == 0) {
        return error(404, {
          error: `User with id ${valid.id} not found`,
        } satisfies APIResponse);
      }

      const token = await rotateJWT(jwt, auth, found[0]);
      return {
        message: "User found",
        data: {
          ...sanitize(found[0], ["password"]),
          token,
        },
      } satisfies APIResponse;
    });

  app
    .onBeforeHandle(authMiddleware)
    .get("/logout", async ({ cookie: { auth } }) => {
      auth.set({
        value: "",
        maxAge: 0,
      });
      return {
        message: "Logout success",
      } satisfies APIResponse;
    });

  return app;
}
