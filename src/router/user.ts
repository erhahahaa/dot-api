import { db } from "~/lib";
import { APIResponse } from "~/types";
import { generateFromEmail } from "~/utils/user";
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

  app.get("find-username", async ({ query: { username, email }, error }) => {
    if (!username || !email) {
      return error(400, {
        error: !username ? "Username is required" : "Email is required",
      } satisfies APIResponse);
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
