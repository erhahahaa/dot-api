import Elysia from "elysia";
import { AuthRepoImpl } from "../feats/auth/auth.repo";
import { ClubRepoImpl } from "../feats/club/club.repo";
import { EvaluationRepoImpl } from "../feats/evaluation/evaluation.repo";
import { ExamRepoImpl } from "../feats/exam/exam.repo";
import { ExerciseRepoImpl } from "../feats/exercise/exercise.repo";
import { MediaRepoImpl } from "../feats/media/media.repo";
import { ProgramRepoImpl } from "../feats/program/program.repo";
import { QuestionRepoImpl } from "../feats/question/question.repo";
import { TacticalRepoImpl } from "../feats/tactical/tactical.repo";
import { UserRepoImpl } from "../feats/user/user.repo";
import { db } from "./services/db";
import { PaymentRepoImpl } from "../feats/payment/payment.repo";

const createGlobalDepedency = () => {
  const authRepo = new AuthRepoImpl(db);
  const userRepo = new UserRepoImpl(db);
  const mediaRepo = new MediaRepoImpl(db);
  const clubRepo = new ClubRepoImpl(db);
  const evaluationRepo = new EvaluationRepoImpl(db);
  const examRepo = new ExamRepoImpl(db);
  const exerciseRepo = new ExerciseRepoImpl(db);
  const programRepo = new ProgramRepoImpl(db);
  const questionRepo = new QuestionRepoImpl(db);
  const tacticalRepo = new TacticalRepoImpl(db);
  const paymentRepo = new PaymentRepoImpl(db);

  return new Elysia().derive({ as: "global" }, () => {
    return {
      authRepo,
      userRepo,
      mediaRepo,
      clubRepo,
      evaluationRepo,
      examRepo,
      exerciseRepo,
      programRepo,
      questionRepo,
      tacticalRepo,
      paymentRepo,
    };
  });
};

export const GlobalDependency = createGlobalDepedency();
