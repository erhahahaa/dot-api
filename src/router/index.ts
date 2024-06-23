import { ServerType } from "..";
import { createAuthRouter } from "./auth";
import { createExamRouter } from "./exam";
import { createHealthRouter } from "./health";
import { createProgramRouter } from "./program";
import { createQuestionRouter } from "./question";
import { createTacticalRouter } from "./tactical";

export function createRouter(app: ServerType) {
  return app.group("/api", (app) => {
    app.group("/auth", (app) => createAuthRouter(app as any));
    app.group("/program", (app) => {
      createProgramRouter(app as any);
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
}
