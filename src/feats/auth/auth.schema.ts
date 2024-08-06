import { Static, t } from "elysia";
import { InsertUserSchema } from "../user/user.schema";

export const AuthSignInSchema = t.Object({
  identifier: t.String(),
  password: t.String(),
});

export const AuthJWTSchema = t.Object({
  id: t.Number(),
  email: t.String(),
  name: t.String(),
  image: t.String(),
  exp: t.Number(),
  iat: t.Number(),
});

export type AuthSignIn = Static<typeof AuthSignInSchema>;
export type AuthSignUp = Static<typeof InsertUserSchema>;
export type AuthJWT = Static<typeof AuthJWTSchema>;
