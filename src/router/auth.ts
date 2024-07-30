import { eq, or } from "drizzle-orm";
import { t } from "elysia";
import { db } from "~/lib";
import { authMiddleware } from "~/middleware";
import { InsertUserSchema, users } from "~/schemas/users";
import { APIResponse } from "~/types";
import { sanitize } from "~/utils";
import { rotateJWT } from "~/utils/jwt";
import { encryptPassword, verifyPassword } from "~/utils/password";
import { ServerType } from "..";

export function createAuthRouter(app: ServerType) {
  app.post(
    "/sign-in",
    async ({ jwt, cookie: { auth }, body, error }) => {
      const identifier = body.identifier;
      if (identifier?.startsWith("0")) {
        body.identifier = `62${identifier}`;
      }
      if (identifier?.startsWith("8")) {
        body.identifier = `62${identifier}`;
      }
      if (identifier?.startsWith("+62")) {
        body.identifier = identifier.replace("+", "");
      }

      const isPhone = /^\d+$/.test(body.identifier ?? "");

      const user = await db
        .select()
        .from(users)
        .where(
          or(
            eq(users.email, body.identifier ?? ""),
            eq(users.username, body.identifier ?? ""),
            isPhone
              ? eq(users.phone, parseInt(body.identifier ?? ""))
              : undefined
          )
        );

      if (user.length == 0) {
        return error(404, {
          error: `Email, username, or phone not found`,
          message: `User with email, username, or phone ${body.identifier} not found`,
        } satisfies APIResponse);
      }

      const isValid = await verifyPassword(body.password, user[0].password);

      if (!isValid) {
        return error(401, {
          error: `Invalid password`,
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
        identifier: t.Optional(t.String()),
        password: t.String(),
      }),
    }
  );
  app.post(
    "/sign-up",
    async ({ body, error }) => {
      const strPhone = body.phone.toString();
      if (strPhone.length < 9 || strPhone.length > 13) {
        return error(400, {
          error: `Invalid phone number`,
          message: `Phone number must be between 9 and 13 digits`,
        } satisfies APIResponse);
      }

      if (strPhone.startsWith("8")) {
        body.phone = parseInt(`62${strPhone}`);
      } else {
        return error(400, {
          error: `Invalid phone number`,
          message: `Phone number must start with 8`,
        } satisfies APIResponse);
      }

      if (body.username.includes(" ")) {
        return error(400, {
          error: `Username cannot contain spaces`,
          message: `Username cannot contain spaces`,
        } satisfies APIResponse);
      }

      const { bornDate, password, ...rest } = body;

      const find = await db.query.users.findFirst({
        where(fields, { eq, or }) {
          return or(
            eq(fields.email, rest.email),
            eq(fields.username, rest.username),
            eq(fields.phone, rest.phone ?? 0)
          );
        },
      });

      if (find) {
        return error(409, {
          error: `Email, username, or phone already exists`,
          message: `User with email ${rest.email}, username ${rest.username}, or phone ${rest.phone} already exists`,
        } satisfies APIResponse);
      }

      const hash = await encryptPassword(password);

      const user = await db
        .insert(users)
        .values({
          ...rest,
          bornDate: new Date((bornDate as string) || new Date()),
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
