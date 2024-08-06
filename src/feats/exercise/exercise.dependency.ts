import Elysia from "elysia";
import { db } from "../../core/services/db";
import { ExerciseRepoImpl } from "./exercise.repo";

export const Dependency = new Elysia().derive({ as: "scoped" }, () => {
  return {
    get exerciseRepo() {
      return new ExerciseRepoImpl(db);
    },
  };
});
