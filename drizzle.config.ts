import { Config, defineConfig } from "drizzle-kit";

const url =
  process.env.DATABASE_URL ||
  "postgres://postgres:password@localhost:5432/postgres";

export default defineConfig({
  schema: [
    "./src/feats/club/club.model.ts",
    "./src/feats/exam/exam.model.ts",
    "./src/feats/media/media.model.ts",
    "./src/feats/program/program.model.ts",
    "./src/feats/exercise/exercise.model.ts",
    "./src/feats/tactical/tactical.model.ts",
    "./src/feats/user/user.model.ts",
    "./src/feats/evaluation/evaluation.model.ts",
    "./src/feats/question/question.model.ts",
  ],
  out: "./supabase/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url,
  },
  breakpoints: false,
  verbose: true,
  strict: true,
}) satisfies Config;
