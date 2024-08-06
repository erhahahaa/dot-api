import Elysia from "elysia";
import { db } from "../../core/services/db";
import { MediaRepoImpl } from "../media/media.repo";
import { ClubRepoImpl } from "./club.repo";

export const Dependency = () => {
  return new Elysia().derive({ as: "scoped" }, () => {
    return {
      get clubRepo() {
        return new ClubRepoImpl(db);
      },
      get mediaRepo() {
        return new MediaRepoImpl(db);
      },
    };
  });
};
