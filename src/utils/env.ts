import { TypeCompiler } from "@sinclair/typebox/compiler";
import { t } from "elysia";

const EnvSchema = t.Object({
  APP_PORT: t.String({ default: 3000 }),
  SALT_ROUND: t.String({ default: 10 }),
  JWT_SECRET: t.String({ minLength: 10 }),
  DATABASE_URL: t.String({
    error: "DATABASE_URL didn't provided",
    minLength: 10,
  }),
  SUPABASE_URL: t.String({
    error: "SUPABASE_URL didn't provided",
    minLength: 10,
  }),
  SUPABASE_ANON_KEY: t.String({
    error: "SUPABASE_ANON_KEY didn't provided",
    minLength: 10,
  }),
  FIREBASE_PROJECT_ID: t.String({
    error: "FIREBASE_PROJECT_ID didn't provided",
    minLength: 10,
  }),
  FIREBASAE_CLIENT_EMAIL: t.String({
    error: "FIREBASAE_CLIENT_EMAIL didn't provided",
    minLength: 10,
  }),
  FIREBASE_PRIVATE_KEY: t.String({
    error: "FIREBASE_PRIVATE_KEY didn't provided",
    minLength: 10,
  }),
});

const createEnv = (payload: Record<string, string | undefined>) => {
  const EnvCompiler = TypeCompiler.Compile(EnvSchema);

  const err = EnvCompiler.Errors(payload);
  const errs = [...err];
  if (errs.length > 0) {
    errs.forEach((err) => {
      console.error({
        path: err.path,
        message: err.message,
        actualValue: err.value,
      });
    });
    return process.exit(1);
  }

  return EnvCompiler.Decode(payload);
};

const env = createEnv({
  APP_PORT: Bun.env.APP_PORT ?? "3000",
  SALT_ROUND: Bun.env.SALT_ROUND ?? "10",
  JWT_SECRET: Bun.env.JWT_SECRET ?? "secret",
  DATABASE_URL: Bun.env.DATABASE_URL,
  SUPABASE_URL: Bun.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: Bun.env.SUPABASE_ANON_KEY,
  FIREBASE_PROJECT_ID: Bun.env.FIREBASE_PROJECT_ID,
  FIREBASAE_CLIENT_EMAIL: Bun.env.FIREBASAE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY: Bun.env.FIREBASE_PRIVATE_KEY,
});

export { env };
