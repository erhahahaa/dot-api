import { eq } from "drizzle-orm";
import { t } from "elysia";
import { db } from "~/db";
import { InsertUserSchema, users } from "~/schemas/users";
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
      const token = await jwt.sign({
        id: user[0].id,
        email: user[0].email,
        exp: Math.floor(Date.now() / 1000) + 7 * 86400, // 7 days
        iat: Math.floor(Date.now() / 1000),
      });
      auth.set({
        value: token,
        httpOnly: true,
        maxAge: 7 * 86400,
      });

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
  app.get(
    "/me",
    async ({ jwt, cookie: { auth }, request }) => {
      const header = request.headers.get("Authorization");

      let bearer = header?.split(" ")[1];
      if (!bearer) {
        if (auth.value) {
          bearer = auth.value;
        } else {
          return {
            error: "Unauthorized",
          };
        }
      }

      const user = await jwt.verify(bearer);

      if (!user) {
        return {
          error: "Unauthorized",
        };
      }

      const found = await db
        .select()
        .from(users)
        .where(eq(users.id, user.id as number));

      if (found.length == 0) {
        return {
          error: "User not found",
        };
      }

      return sanitize(found[0], ["password"]);
    },
    {}
  );

  return app;
}
