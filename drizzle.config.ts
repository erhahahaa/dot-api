import { Config, defineConfig } from "drizzle-kit";

const url =
  process.env.DATABASE_URL ||
  "postgres://postgres:password@localhost:5432/postgres";

export default defineConfig({
  schema: "./src/schemas/**/*.ts",
  out: "./supabase/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url,
  },
  verbose: true,
  strict: true,
}) satisfies Config;
