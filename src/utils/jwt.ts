import { Cookie } from "elysia";
import { UserType } from "~/schemas/users";
import { JWTPlugin } from "~/types";

export async function rotateJWT(
  jwt: JWTPlugin,
  auth: Cookie<any>,
  user: UserType
) {
  const token = await jwt.sign({
    id: user.id,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + 7 * 86400, // 7 days
    iat: Math.floor(Date.now() / 1000),
  });
  auth.set({
    value: {
      id: user.id,
      email: user.email,
      token,
    },
    httpOnly: true,
    maxAge: 7 * 86400,
  });
  return token;
}
