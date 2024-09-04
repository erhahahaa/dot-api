import Elysia from "elysia";
import { AuthPlugin } from "../feats/auth/auth.plugin";
import { AuthService } from "../feats/auth/auth.service";
import { ClubPlugin } from "../feats/club/club.plugin";
import { EvaluationPlugin } from "../feats/evaluation/evaluation.plugin";
import { ExamPlugin } from "../feats/exam/exam.plugin";
import { ExercisePlugin } from "../feats/exercise/exercise.plugin";
import { HealthRouter } from "../feats/health";
import { MediaPlugin } from "../feats/media/media.plugin";
import { ProgramPlugin } from "../feats/program/program.plugin";
import { QuestionPlugin } from "../feats/question/question.plugin";
import {
  TacticalPlugin,
  TacticalWebSocketPlugin,
} from "../feats/tactical/tactical.plugin";
import { UserPlugin } from "../feats/user/user.plugin";
import { AuthenticationError } from "./errors";

export const WebSocketRouter = new Elysia().group("/live", (app) =>
  app.use(TacticalWebSocketPlugin)
);

export const HTTPRouter = new Elysia()
  .use(AuthService)
  .get("/", ({ redirect }) => redirect("/swagger"))
  .group("/auth", (app) => app.use(AuthPlugin))
  .group("/user", (app) => app.use(UserPlugin))
  .group("/club", (app) =>
    app
      .onBeforeHandle(async ({ verifyJWT }) => {
        const user = await verifyJWT();
        if (!user) throw new AuthenticationError("Unauthorized");
      })
      .use(ClubPlugin)
      .group("/program", (app) =>
        app
          .use(ProgramPlugin)
          .group("/exercise", (app) => app.use(ExercisePlugin))
      )
      .group("/exam", (app) =>
        app
          .use(ExamPlugin)
          .group("/question", (app) => app.use(QuestionPlugin))
          .group("/evaluation", (app) => app.use(EvaluationPlugin))
      )
      .group("/tactical", (app) => app.use(TacticalPlugin))
  )
  .group("/media", (app) =>
    app
      .onBeforeHandle(async ({ verifyJWT }) => {
        const user = await verifyJWT();
        if (!user) throw new AuthenticationError("Unauthorized");
      })
      .use(MediaPlugin)
  )
  .group("/health", (app) => app.use(HealthRouter));
