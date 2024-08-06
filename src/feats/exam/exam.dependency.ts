import Elysia from "elysia";
import { ExamRepoImpl } from ".";
import { db } from "../../core/services/db";
import { MediaRepoImpl } from "../media/media.repo";

export const Dependency = () => {
  return new Elysia().derive({ as: "scoped" }, () => {
    return {
      get examRepo() {
        return new ExamRepoImpl(db);
      },
      get mediaRepo() {
        return new MediaRepoImpl(db);
      },
    };
  });
};
