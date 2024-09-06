import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  ClubModel,
  ClubRelation,
  SportTypeModel,
} from "../../feats/club/club.model";
import {
  EvaluationModel,
  EvaluationRelation,
} from "../../feats/evaluation/evaluation.model";
import { ExamModel, ExamRelation } from "../../feats/exam/exam.model";
import {
  ExerciseModel,
  ExerciseRelation,
} from "../../feats/exercise/exercise.model";
import { MediaModel, MediaRelation } from "../../feats/media/media.model";
import {
  ProgramModel,
  ProgramRelation,
} from "../../feats/program/program.model";
import {
  QuestionModel,
  QuestionRelation,
} from "../../feats/question/question.model";
import {
  TacticalModel,
  TacticalRelation,
} from "../../feats/tactical/tactical.model";
import {
  UserModel,
  UserRelation,
  UserToClubModel,
  UserToClubRelation,
} from "../../feats/user/user.model";
import { env } from "../../utils/env";

const pgClient = postgres(env.DATABASE_URL);
const db = drizzle(pgClient, {
  logger: env.NODE_ENV === "development",
  schema: {
    SportTypeModel,
    ClubModel,
    ClubRelation,
    EvaluationModel,
    EvaluationRelation,
    ExamModel,
    ExamRelation,
    ExerciseModel,
    ExerciseRelation,
    MediaModel,
    MediaRelation,
    ProgramModel,
    ProgramRelation,
    QuestionModel,
    QuestionRelation,
    TacticalModel,
    TacticalRelation,
    UserModel,
    UserRelation,
    UserToClubModel,
    UserToClubRelation,
  },
});

type DrizzlePostgres = typeof db;

export { db, DrizzlePostgres };
