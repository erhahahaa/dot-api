import { ServerType } from "..";
import { createAuthRouter } from "./auth";

export function createRouter(app: ServerType) {
  app.group("/api", (app) => {
    app.group("/auth", (app) => createAuthRouter(app as any));
    return app;
  });

  return app;
}
