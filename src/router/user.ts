import { db } from "~/lib";
import { APIResponse } from "~/types";
import { ServerType } from "..";

export function createUserRouter(app: ServerType) {
  app.get("/search", async ({ query: { query }, error }) => {
    const find = await db.query.users.findMany({
      where(fields, { ilike }) {
        return ilike(fields.name, `%${query}%`);
      },
      columns: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        role: true,
        expertise: true,
        createdAt: true,
        updatedAt: true,
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
