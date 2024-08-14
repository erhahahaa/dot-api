import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../../utils/env";

const pgClient = postgres(env.DATABASE_URL);
const db = drizzle(pgClient, { logger: env.NODE_ENV === "development" });

type DrizzlePostgres = typeof db;

export { db, DrizzlePostgres };
