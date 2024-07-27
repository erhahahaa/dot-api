import { db } from "~/lib";
import { APIResponse } from "~/types";
import { ServerType } from "..";

export function createUser(app: ServerType) {
  app.get("/:query", async ({ params: { query }, error }) => {
    const find = await db.query.users.findMany({
      where(fields, { like }) {
        return like(fields.name, `%${query}%`);
      },
    });
    if (find.length === 0) {
      return error(404, {
        error: "User not found",
      } satisfies APIResponse);
    }

    return {
      message: "User found",
      data: find,
    } satisfies APIResponse;
  });

  return app;
}
