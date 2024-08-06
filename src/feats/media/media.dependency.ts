import Elysia from "elysia";
import { db } from "../../core/services/db";
import { ClubRepoImpl } from "../club/club.repo";
import { MediaRepoImpl } from "./media.repo";

export const Dependency = () => {
  return new Elysia().derive({ as: "scoped" }, () => {
    return {
      get mediaRepo() {
        return new MediaRepoImpl(db);
      },

      get clubRepo() {
        return new ClubRepoImpl(db);
      },
    };
  });
};
