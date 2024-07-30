import bearer from "@elysiajs/bearer";
import cors from "@elysiajs/cors";
import jwt from "@elysiajs/jwt";
import { swagger } from "@elysiajs/swagger";
import { config } from "dotenv";
import { Elysia, error, ValidationError } from "elysia";
import logixlysia from "logixlysia";
import {
  AuthenticationError,
  AuthorizationError,
  BadRequestError,
  ERROR_CODE_STATUS_MAP,
} from "~/errors";
import { description, version } from "../package.json";
import { sb } from "./lib";
import { createRouter } from "./router";
import { logConfig } from "./utils";

config({ path: ".env" });

const BUCKETS_NAME = [
  "users",
  "clubs",
  "programs",
  "exercises",
  "exams",
  "questions",
];

async function initalizeSupabase() {
  const buckets = await sb.storage.listBuckets();
  if (buckets.error) throw error;

  for (const bucket of BUCKETS_NAME) {
    if (!buckets.data.find((b) => b.name === bucket)) {
      const newBucket = await sb.storage.createBucket(bucket, { public: true });
      if (newBucket.error) throw newBucket.error;
      console.log("Bucket created", newBucket.data);
    }
  }

  console.log("Buckets ready 🚀");
}

export const app = new Elysia({
  name: "DOT Coaching API",
  precompile: true,
  serve: {
    maxRequestBodySize: Number.MAX_SAFE_INTEGER,
  },
})
  .use(
    logixlysia({
      config: logConfig,
    })
  )
  .error({
    AUTHENTICATION: AuthenticationError,
    AUTHORIZATION: AuthorizationError,
    BAD_REQUEST: BadRequestError,
    VALIDATION: ValidationError,
  })
  // .onRequest(async ({ request }) => {
  //   console.log("[BODY]\n", await request.json());
  // })
  .onError(({ error, code, set, request }) => {
    if (code == "VALIDATION") {
      console.log(error.all);
      return { errors: error.all };
    }
    set.status = ERROR_CODE_STATUS_MAP.get(code);
    const errorType = "type" in error ? error.type : "internal";
    return { errors: { [errorType]: error.message } };
  })

  .use(cors())
  .use(
    swagger({
      documentation: {
        info: { title: "DOT Coaching API", version, description },
      },
    })
  )
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET ?? "secret",
      exp: "7d",
    })
  )
  .use(bearer());

export type ServerType = typeof app;

async function main() {
  await initalizeSupabase();
  createRouter(app);

  app.listen(3000, () => {
    console.log(`Server started successfully 🚀`);
  });
}

main();
