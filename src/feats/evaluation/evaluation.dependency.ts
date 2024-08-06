import Elysia from "elysia";
import { db } from "../../core/services/db";
import { EvaluationRepoImpl } from "./evaluation.repo";

export const Dependency = () => {
  return new Elysia().derive({ as: "scoped" }, () => {
    return {
      get evaluationRepo() {
        return new EvaluationRepoImpl(db);
      },
    };
  });
};
