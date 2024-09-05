import Elysia, { t } from "elysia";
import { GlobalDependency } from "../../core/di";
import { AuthorizationError, BadRequestError } from "../../core/errors";
import { APIResponseSchema } from "../../core/response";
import { BucketService } from "../../core/services/bucket";
import { IdParam } from "../../utils/param";
import { AuthService } from "../auth/auth.service";
import { MediaType } from "../media/media.schema";
import {
  InsertUserToClubSchema,
  SelectUserToClubSchema,
} from "../user/user.schema";
import {
  ClubMemberSchema,
  InsertClubSchema,
  SelectClubExtendedSchema,
} from "./club.schema";

export const ClubPlugin = new Elysia({
  name: "Day of Training Club API",
  tags: ["CLUB"],
})
  .use(GlobalDependency)
  .use(AuthService)
  .use(BucketService)
  .model("club.insert", InsertClubSchema)
  .model("club.response", APIResponseSchema(SelectClubExtendedSchema))
  .use(IdParam)
  .model("club.members", APIResponseSchema(ClubMemberSchema))
  .model("club.member.relation", APIResponseSchema(SelectUserToClubSchema))
  .get(
    "/",
    async ({ verifyJWT, clubRepo }) => {
      const user = await verifyJWT();

      const clubs = await clubRepo.list({ userId: user.id });
      return {
        message: "Found clubs",
        data: clubs,
      };
    },
    {
      response: { 200: APIResponseSchema(t.Array(SelectClubExtendedSchema)) },
    },
  )
  .post(
    "/",
    async ({ clubRepo, mediaRepo, body, verifyJWT, uploadFile }) => {
      const user = await verifyJWT();

      const { image, ...rest } = body;

      let media = undefined;
      if (image) {
        const result = await uploadFile({ parent: "club", blob: image });
        media = await mediaRepo.create({
          creatorId: user.id,
          name: image.name,
          fileSize: image.size,
          type: image.type as MediaType,
          parent: "club",
          path: result.name,
          url: result.url,
        });
        rest.mediaId = media.id;
      }

      const club = await clubRepo.create({
        ...rest,
        creatorId: user.id,
      });

      if (media) await mediaRepo.update({ ...media, clubId: club.id });

      return {
        message: "Created club",
        data: club,
      };
    },
    {
      body: "club.insert",
      response: { 200: "club.response" },
    },
  )
  .get(
    "/:id",
    async ({ clubRepo, params: { id } }) => {
      const club = await clubRepo.find(id);

      return {
        message: "Found club",
        data: club,
      };
    },
    {
      params: "id.param",
      response: { 200: "club.response" },
    },
  )
  .put(
    "/:id",
    async ({
      clubRepo,
      mediaRepo,
      params: { id },
      body,
      verifyJWT,
      uploadFile,
      deleteFile,
    }) => {
      const user = await verifyJWT();

      const findClub = await clubRepo.find(id);

      const { image, ...rest } = body;

      let media = undefined;
      if (image) {
        const result = await uploadFile({ parent: "club", blob: image });
        media = await mediaRepo.create({
          clubId: id,
          creatorId: user.id,
          name: image.name,
          fileSize: image.size,
          type: image.type as MediaType,
          parent: "club",
          path: result.name,
          url: result.url,
        });
        rest.mediaId = media.id;
      }

      const club = await clubRepo.update({
        ...rest,
        id: id,
      });

      if (media && findClub.media) {
        const { path, id } = findClub.media;
        if (path) {
          await Promise.all([
            deleteFile({
              parent: "club",
              path,
            }),
            mediaRepo.delete(id),
          ]);
        }
      }

      return {
        message: "Updated club",
        data: club,
      };
    },
    {
      params: "id.param",
      body: "club.insert",
      response: { 200: "club.response" },
    },
  )
  .delete(
    "/:id",
    async ({ clubRepo, mediaRepo, params: { id }, deleteFile }) => {
      const club = await clubRepo.find(id);

      if (club.media) {
        const { path, id } = club.media;
        if (path) {
          await Promise.all([
            deleteFile({
              parent: "club",
              path,
            }),
            mediaRepo.delete(id),
          ]);
        }
      }

      const deletedClub = await clubRepo.delete(id);

      return {
        message: "Deleted club",
        data: deletedClub,
      };
    },
    {
      params: "id.param",
      response: { 200: "club.response" },
    },
  )
  .get(
    "/:id/members",
    async ({ clubRepo, params: { id } }) => {
      const members = await clubRepo.getMembers(id);
      return {
        message: "Found members",
        data: members,
      };
    },
    {
      params: "id.param",
      response: { 200: APIResponseSchema(t.Array(ClubMemberSchema)) },
    },
  )
  .get(
    "/:id/add/:userId/:role",
    async ({ clubRepo, params: { id, userId, role } }) => {
      if (!role) role = "athlete";
      try {
        const find = await clubRepo.findMember(id, userId);
        if (find) throw new BadRequestError("User already in club");
      } catch (error) {
        if (error instanceof BadRequestError) throw error;
      }
      const club = await clubRepo.addMember(id, userId, role);
      return {
        message: "Added member",
        data: club,
      };
    },
    {
      params: t.Object({
        id: t.Number(),
        userId: t.Number(),
        role: InsertUserToClubSchema.properties.role,
      }),
      response: { 200: "club.members" },
    },
  )
  .get(
    "/:id/kick/:userId",
    async ({ clubRepo, params: { id, userId }, verifyJWT }) => {
      const user = await verifyJWT();
      const me = await clubRepo.findMember(id, user.id);
      if (me.role !== "coach")
        throw new AuthorizationError("You are not allowed to kick members");
      const club = await clubRepo.kickMember(id, userId);
      return {
        message: "Kicked member",
        data: club,
      };
    },
    {
      params: t.Object({
        id: t.Number(),
        userId: t.Number(),
      }),
      response: { 200: "club.member.relation" },
    },
  )
  .get(
    "/:id/join",
    async ({ clubRepo, params: { id }, verifyJWT }) => {
      const user = await verifyJWT();
      const club = await clubRepo.addMember(id, user.id, "athlete");
      return {
        message: "Joined club",
        data: club,
      };
    },
    {
      params: "id.param",
      response: { 200: "club.members" },
    },
  )
  .get(
    "/:id/leave",
    async ({ clubRepo, params: { id }, verifyJWT }) => {
      const user = await verifyJWT();
      const club = await clubRepo.leave(id, user.id);
      return {
        message: "Left club",
        data: club,
      };
    },
    {
      params: "id.param",
      response: { 200: "club.member.relation" },
    },
  )
  .get(
    "/:id/promote/:userId",
    async ({ clubRepo, params: { id, userId }, verifyJWT }) => {
      const user = await verifyJWT();
      const me = await clubRepo.findMember(id, user.id);
      if (me.role !== "coach")
        throw new AuthorizationError("You are not allowed to promote members");
      const club = await clubRepo.promoteMember(id, userId);
      return {
        message: "Promoted member",
        data: club,
      };
    },
    {
      params: t.Object({
        id: t.Number(),
        userId: t.Number(),
      }),
      response: { 200: "club.member.relation" },
    },
  )
  .get(
    "/:id/demote/:userId",
    async ({ clubRepo, params: { id, userId }, verifyJWT }) => {
      const user = await verifyJWT();
      const me = await clubRepo.findMember(id, user.id);
      if (me.role !== "coach")
        throw new AuthorizationError("You are not allowed to demote members");
      const club = await clubRepo.demoteMember(id, userId);
      return {
        message: "Demoted member",
        data: club,
      };
    },
    {
      params: t.Object({
        id: t.Number(),
        userId: t.Number(),
      }),
      response: { 200: "club.member.relation" },
    },
  );
