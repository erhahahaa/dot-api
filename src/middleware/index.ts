import { Cookie } from "elysia";
import { JWTPlugin } from "~/types";

export async function authMiddleware({
  request,
  jwt,
  bearer,
  cookie: { auth },
}: {
  request: Request;
  jwt: JWTPlugin;
  cookie: Record<string, Cookie<any>>;
  bearer?: string;
}) {
  const header = request.headers.get("Authorization");

  bearer = header?.split(" ")[1];
  if (!bearer) {
    if (auth.value) {
      bearer = auth.value;
    } else {
      return {
        error: "Unauthorized, missing bearer token",
      };
    }
  }
  const valid = await jwt.verify(bearer);
  if (!valid) {
    return {
      error: "Unauthorized, invalid bearer token",
    };
  }
  return;
}
