import Elysia from "elysia";
import { db } from "../../core/services/db";
import { QuestionRepoImpl } from "./question.repo";

export const Dependency = () => {
  return new Elysia().derive({ as: "scoped" }, () => {
    return {
      get questionRepo() {
        return new QuestionRepoImpl(db);
      },
    };
  });
};
