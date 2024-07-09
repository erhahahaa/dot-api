import { Cookie, error as ElysiaErrorStatus } from "elysia";
import { APIResponse, JWTPlugin } from "~/types";

export async function authMiddleware({
  request,
  jwt,
  bearer,
  cookie: { auth },
  error,
}: {
  request: Request;
  jwt: JWTPlugin;
  cookie: Record<string, Cookie<any>>;
  bearer?: string;
  error: typeof ElysiaErrorStatus;
}) {
  const header = request.headers.get("Authorization");

  bearer = header?.split(" ")[1];
  if (!bearer) {
    if (auth.value) {
      bearer = auth.value;
    } else {
      return error(401, {
        error: "Unauthorized",
        message: "Invalid session, please sign in again",
      } satisfies APIResponse);
    }
  }
  const valid = await jwt.verify(bearer);
  if (!valid) {
    return error(401, {
      error: "Unauthorized",
      message: "Invalid session, please sign in again",
    } satisfies APIResponse);
  }
  return;
}
