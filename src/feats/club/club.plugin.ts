import Elysia, { t } from "elysia";
import { AuthorizationError } from "../../core/errors";
import { APIResponseSchema } from "../../core/response";
import { BucketService } from "../../core/services/bucket";
import { CacheService } from "../../core/services/cache";
import { AuthService } from "../auth/auth.service";
import { MediaType } from "../media/media.schema";
import { SelectUserToClubSchema } from "../user/user.schema";
import { Dependency } from "./club.dependency";
import {
  ClubExtended,
  ClubMember,
  ClubMemberSchema,
  InsertClubSchema,
  SelectClubExtendedSchema,
} from "./club.schema";

export const ClubPlugin = new Elysia()
  .use(Dependency)
  .use(AuthService)
  .use(BucketService)
  .use(CacheService(100, 60 * 60 * 1000)) // 100 items, 1 hour
  .get(
    "/",
    async ({ verifyJWT, clubRepo, cache, query: { useCache = false } }) => {
      const user = await verifyJWT();

      const cached = cache.get<ClubExtended[]>(`clubs_${user.id}`);
      if (cached) {
        return {
          message: "Found clubs",
          data: cached,
        };
      }
      const clubs = await clubRepo.list({ userId: user.id });
      cache.set(`clubs_${user.id}`, clubs);

      return {
        message: "Found clubs",
        data: clubs,
      };
    },
    {
      detail: {
        tags: ["CLUB"],
      },
      query: t.Object({
        useCache: t.Optional(t.Boolean()),
      }),
      response: APIResponseSchema(t.Array(SelectClubExtendedSchema)),
    }
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
      }

      const club = await clubRepo.create({
        ...rest,
        creatorId: user.id,
        mediaId: media?.id,
      });

      if (media) await mediaRepo.update({ ...media, clubId: club.id });

      return {
        message: "Created club",
        data: club,
      };
    },
    {
      detail: {
        tags: ["CLUB"],
      },
      body: InsertClubSchema,
      response: APIResponseSchema(SelectClubExtendedSchema),
      afterHandle: async ({ cache, verifyJWT }) => {
        const user = await verifyJWT();
        cache.delete(`clubs_${user.id}`);
      },
    }
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
      detail: {
        tags: ["CLUB"],
      },
      params: t.Object({
        id: t.Number(),
      }),
      response: APIResponseSchema(SelectClubExtendedSchema),
    }
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
          creatorId: user.id,
          name: image.name,
          fileSize: image.size,
          type: image.type as MediaType,
          parent: "club",
          path: result.name,
          url: result.url,
        });
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
      detail: {
        tags: ["CLUB"],
      },
      params: t.Object({
        id: t.Number(),
      }),
      body: InsertClubSchema,
      response: APIResponseSchema(SelectClubExtendedSchema),
      afterHandle: async ({ cache, verifyJWT }) => {
        const user = await verifyJWT();
        cache.delete(`clubs_${user.id}`);
      },
    }
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
      detail: {
        tags: ["CLUB"],
      },
      params: t.Object({
        id: t.Number(),
      }),
      response: APIResponseSchema(SelectClubExtendedSchema),
      afterHandle: async ({ cache, verifyJWT }) => {
        const user = await verifyJWT();
        cache.delete(`clubs_${user.id}`);
      },
    }
  )
  .get(
    "/:id/members",
    async ({ clubRepo, params: { id }, cache }) => {
      const cached = cache.get<ClubMember[]>(`club_members_${id}`);

      if (cached) {
        return {
          message: "Found members",
          data: cached,
        };
      }

      const members = await clubRepo.getMembers(id);
      return {
        message: "Found members",
        data: members,
      };
    },
    {
      detail: {
        tags: ["CLUB"],
      },
      params: t.Object({
        id: t.Number(),
      }),
      response: APIResponseSchema(t.Array(ClubMemberSchema)),
    }
  )
  .get(
    "/:id/add/:userId",
    async ({ clubRepo, params: { id, userId } }) => {
      const club = await clubRepo.addMember(id, userId);
      return {
        message: "Added member",
        data: club,
      };
    },
    {
      detail: {
        tags: ["CLUB"],
      },
      params: t.Object({
        id: t.Number(),
        userId: t.Number(),
      }),
      response: APIResponseSchema(ClubMemberSchema),
      afterHandle: async ({ cache, params: { id } }) => {
        cache.delete(`club_members_${id}`);
      },
    }
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
      detail: {
        tags: ["CLUB"],
      },
      params: t.Object({
        id: t.Number(),
        userId: t.Number(),
      }),
      response: APIResponseSchema(SelectUserToClubSchema),
      afterHandle: async ({ cache, params: { id } }) => {
        cache.delete(`club_members_${id}`);
      },
    }
  )
  .get(
    "/:id/join",
    async ({ clubRepo, params: { id }, verifyJWT }) => {
      const user = await verifyJWT();
      const club = await clubRepo.addMember(id, user.id);
      return {
        message: "Joined club",
        data: club,
      };
    },
    {
      detail: {
        tags: ["CLUB"],
      },
      params: t.Object({
        id: t.Number(),
      }),
      response: APIResponseSchema(ClubMemberSchema),
      afterHandle: async ({ cache, params: { id } }) => {
        cache.delete(`club_members_${id}`);
      },
    }
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
      detail: {
        tags: ["CLUB"],
      },
      params: t.Object({
        id: t.Number(),
      }),
      response: APIResponseSchema(SelectUserToClubSchema),
      afterHandle: async ({ cache, params: { id } }) => {
        cache.delete(`club_members_${id}`);
      },
    }
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
      detail: {
        tags: ["CLUB"],
      },
      params: t.Object({
        id: t.Number(),
        userId: t.Number(),
      }),
      response: APIResponseSchema(SelectUserToClubSchema),
      afterHandle: async ({ cache, params: { id } }) => {
        cache.delete(`club_members_${id}`);
      },
    }
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
      detail: {
        tags: ["CLUB"],
      },
      params: t.Object({
        id: t.Number(),
        userId: t.Number(),
      }),
      response: APIResponseSchema(SelectUserToClubSchema),
      afterHandle: async ({ cache, params: { id } }) => {
        cache.delete(`club_members_${id}`);
      },
    }
  );
