import { Cookie } from "elysia";
import { APIResponse, JWTPlugin } from "~/types";

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
        error: "Unauthorized",
        message: "Bearer token not found in header or cookie auth",
      } satisfies APIResponse;
    }
  }
  const valid = await jwt.verify(bearer);
  if (!valid) {
    return {
      error: "Unauthorized",
      message: "Bearer token not valid",
    } satisfies APIResponse;
  }
  return;
}
