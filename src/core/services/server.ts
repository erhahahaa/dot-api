import cors from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia, ValidationError } from "elysia";

import {
  AuthenticationError,
  AuthorizationError,
  BadRequestError,
  ServerError,
  StorageError,
  UnsupportedMediaTypeError,
} from "../errors";
import { HTTPRouter, WebSocketRouter } from "../router";

export function createApp() {
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
    .error({
      AUTHENTICATION: AuthenticationError,
      AUTHORIZATION: AuthorizationError,
      BAD_REQUEST: BadRequestError,
      VALIDATION: ValidationError,
      STORAGE_ERROR: StorageError,
      SERVER_ERROR: ServerError,
      UNKNOWN: ServerError,
      UNSUPPORTED_MEDIA_TYPE: UnsupportedMediaTypeError,
    })
    .onError(({ error, code, set, route, path }) => {
      try {
        console.error("<=============== ERROR ===============>");
        console.log("[ROUTE] : ", route);
        console.log("[PATH] : ", path);
        console.log("[NAME] : ", error.name);
        console.log("[CAUSE] : ", error.cause);
        console.log("[MESSAGE] : ", error.message);
        console.log("[STACK] : ", error.stack);
        console.error("<=============== ERROR ===============>");

        let httpCode;
        switch (code) {
          case "PARSE":
          case "BAD_REQUEST":
            httpCode = 400;
            break;
          case "UNSUPPORTED_MEDIA_TYPE":
            httpCode = 415;
            break;
          case "VALIDATION":
            httpCode = 422;
            break;
          case "NOT_FOUND":
            httpCode = 404;
            break;
          case "INVALID_COOKIE_SIGNATURE":
          case "AUTHENTICATION":
          case "AUTHORIZATION":
            httpCode = 401;
            break;
          case "INTERNAL_SERVER_ERROR":
          case "UNKNOWN":
            httpCode = 500;
            break;

          default:
            httpCode = 500;
            break;
        }
        set.status = httpCode;
        const errorType = "type" in error ? error.type : "internal";
        if (code == "VALIDATION") {
          return { errors: error.all };
        }
        return Response.json(
          {
            errors: error.message,
            type: errorType,
          },
          { status: httpCode }
        );
      } catch (error) {
        console.log(error);

        return { errors: "Internal server error", type: "internal" };
      }
    })
    .use(cors())
    .use(
      swagger({
        exclude: ["/"],
      })
    )
    .use(WebSocketRouter)
    .use(HTTPRouter)
    .onStart(async () => {
      console.log("Server started 🚀");
    });

  return app;
}
