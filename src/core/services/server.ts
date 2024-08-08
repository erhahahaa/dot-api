import cors from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia, ValidationError } from "elysia";
import logixlysia from "logixlysia";

import fs from "fs";
import path from "path";
import { description, version } from "../../../package.json";
import {
  AuthenticationError,
  AuthorizationError,
  BadRequestError,
  ERROR_CODE_STATUS_MAP,
  NoContentError,
  ServerError,
  StorageError,
} from "../errors";
import { HTTPRouter, WebSocketRouter } from "../router";

export function createApp() {
  const logFilePath = path.join(__dirname, "..", "../..", "logs", "app.log");
  if (!fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, "");
  }
  const app = new Elysia({
    name: "DOT Coaching API",
    precompile: true,
    serve: {
      maxRequestBodySize: Number.MAX_SAFE_INTEGER,
    },
    websocket: {
      perMessageDeflate: true,
    },
  })
    .use(
      logixlysia({
        config: {
          ip: true,
          logFilePath,
          customLogFormat:
            "🦊 {now} {level} {duration} {method} {pathname} {status} {message} {ip}",
        },
      })
    )
    .error({
      AUTHENTICATION: AuthenticationError,
      AUTHORIZATION: AuthorizationError,
      BAD_REQUEST: BadRequestError,
      VALIDATION: ValidationError,
      STORAGE_ERROR: StorageError,
      SERVER_ERROR: ServerError,
      UNKNOWN: ServerError,
      NO_CONTENT: NoContentError,
    })
    .onError(({ error, code, set }) => {
      try {
        console.error("<=============== ERROR ===============>");
        console.log("[NAME] : ", error.name);
        console.log("[CAUSE] : ", error.cause);
        console.log("[MESSAGE] : ", error.message);
        console.log("[STACK] : ", error.stack);
        console.error("<=============== ERROR ===============>");
        if (code == "VALIDATION") {
          return { errors: error.all };
        }
        set.status = ERROR_CODE_STATUS_MAP.get(code);
        const errorType = "type" in error ? error.type : "internal";
        return { errors: error.message, type: errorType };
      } catch (error) {
        console.log(error);
        return { errors: "Internal server error", type: "internal" };
      }
    })
    .use(cors())
    .use(
      swagger({
        documentation: {
          info: { title: "DOT Coaching API", version, description },
        },
      })
    )
    .use(WebSocketRouter)
    .use(HTTPRouter)
    .onStart(async () => {
      console.log("Server started 🚀");
    });

  return app;
}
