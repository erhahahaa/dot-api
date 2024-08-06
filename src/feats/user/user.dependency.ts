import Elysia from "elysia";
import { db } from "../../core/services/db";
import { MediaRepoImpl } from "../media/media.repo";
import { UserRepoImpl } from "./user.repo";

export const Dependency = () => {
  return new Elysia().derive({ as: "scoped" }, () => {
    return {
      get userRepo() {
        return new UserRepoImpl(db);
      },
      get mediaRepo() {
        return new MediaRepoImpl(db);
      },
    };
  });
};
