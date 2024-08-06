import Elysia from "elysia";
import { db } from "../../core/services/db";
import { UserRepoImpl } from "../user/user.repo";
import { AuthRepoImpl } from "./auth.repo";

export const Dependency = () => {
  return new Elysia().derive({ as: "scoped" }, () => {
    return {
      get authRepo() {
        return new AuthRepoImpl(db);
      },
      get userRepo() {
        return new UserRepoImpl(db);
      },
    };
  });
};
