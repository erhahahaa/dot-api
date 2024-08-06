import Elysia from "elysia";
import { db } from "../../core/services/db";
import { MediaRepoImpl } from "../media/media.repo";
import { ProgramRepoImpl } from "./program.repo";

export const Dependency = () => {
  return new Elysia().derive({ as: "scoped" }, () => {
    return {
      get programRepo() {
        return new ProgramRepoImpl(db);
      },
      get mediaRepo() {
        return new MediaRepoImpl(db);
      },
    };
  });
};
