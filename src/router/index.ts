import { authMiddleware } from "~/middleware";
import { ServerType } from "..";
import { createAuthRouter } from "./auth";
import { createClubRouter } from "./club";
import { createExamRouter } from "./exam";
import { createHealthRouter } from "./health";
import { createProgramRouter } from "./program";
import { createQuestionRouter } from "./question";
import { createTacticalRouter } from "./tactical/http";
import { createLiveTacticalRouter } from "./tactical/ws";

export function createRouter(app: ServerType) {
  app.group("/ws", (app) => {
    createLiveTacticalRouter(app as any);
    return app;
  });
  app.group("/api", (app) => {
    app.group("/auth", (app) => createAuthRouter(app as any));
    app.group("/club", (app) => {
      app.onBeforeHandle(authMiddleware);
      createClubRouter(app as any);
      app.group("/program", (app) => createProgramRouter(app as any));
      app.group("/exam", (app) => {
        createExamRouter(app as any);
        app.group("/question", (app) => createQuestionRouter(app as any));
        return app;
      });
      app.group("/tactical", (app) => createTacticalRouter(app as any));
      return app;
    });
    app.group("/health", (app) => createHealthRouter(app as any));
    return app;
  });

  return app;
}
