import { authMiddleware } from "~/middleware";
import { ServerType } from "..";
import { createAuthRouter } from "./auth";
import { createClubRouter } from "./club";
import { createEvaluationRouter } from "./evaluation";
import { createExamRouter } from "./exam";
import { createExerciseRouter } from "./exercise";
import { createHealthRouter } from "./health";
import { createMediaRouter } from "./media";
import { createProgramRouter } from "./program";
import { createQuestionRouter } from "./question";
import { createTacticalRouter } from "./tactical/http";
import { createLiveTacticalRouter } from "./tactical/ws";
import { createUserRouter } from "./user";

export function createRouter(app: ServerType) {
  app.group("/ws", (app: any) => {
    createLiveTacticalRouter(app);
    return app;
  });

  app.group("/auth", (app: any) => createAuthRouter(app));
  app.group("/user", (app: any) => {
    createUserRouter(app);
    return app;
  });
  app.group("/club", (app: any) => {
    app.onBeforeHandle(authMiddleware);
    createClubRouter(app);
    app.group("/program", (app: any) => {
      createProgramRouter(app);
      app.group("/exercise", (app: any) => createExerciseRouter(app));
      return app;
    });
    app.group("/exam", (app: any) => {
      createExamRouter(app);
      app.group("/question", (app: any) => createQuestionRouter(app));
      createEvaluationRouter(app);
      return app;
    });
    app.group("/tactical", (app: any) => createTacticalRouter(app));
    return app;
  });
  app.group("/health", (app: any) => createHealthRouter(app));
  app.onBeforeHandle(authMiddleware);
  app.group("/media", (app: any) => createMediaRouter(app));

  return app;
}
