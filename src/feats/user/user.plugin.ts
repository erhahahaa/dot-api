import Elysia, { t } from "elysia";
import { BucketService } from "../../core/services/bucket";
import { generateFromEmail } from "../../utils/user";
import { AuthService } from "../auth/auth.service";
import { MediaType } from "../media/media.schema";
import { Dependency } from "./user.dependency";

export const UserPlugin = new Elysia()
  .use(Dependency)
  .use(AuthService)
  .use(BucketService)
  .put(
    "/update",
    async ({ userRepo, body }) => {
      const res = await userRepo.update(body as any);

      return {
        message: "User updated",
        data: res,
      };
    },
    {
      detail: {
        tags: ["USER"],
      },
      // body: t.Partial(InsertUserSchema),
      // response: APIResponseSchema(
      //   t.Omit(SelectUserSchema, ["password", "fcmToken"])
      // ),
    }
  )
  .put(
    "/update-photo",
    async ({
      userRepo,
      mediaRepo,
      body,
      verifyJWT,
      uploadFile,
      deleteFile,
    }) => {
      const data = body as any;
      const user = await verifyJWT();
      const { image } = data;

      const findUser = await userRepo.find(user.id);

      if (findUser.image) {
        try {
          const { path } = await mediaRepo.findByURL(findUser.image);
          if (path) await deleteFile({ parent: "user", path });
        } catch (error) {}
      }

      const upload = await uploadFile({ parent: "user", blob: image });

      const media = await mediaRepo.create({
        creatorId: user.id,
        name: data.image.name,
        fileSize: data.image.size,
        path: upload.name,
        parent: "user",
        type: data.image.type as MediaType,
        url: upload.url,
      });

      const updatedUser = await userRepo.update({
        ...findUser,
        image: media.url,
        password: null,
      });

      return {
        message: "User photo updated",
        data: updatedUser,
      };
    },
    {
      detail: {
        tags: ["USER"],
      },
      // body: t.Object({
      //   image: t.File(),
      // }),
      // response: APIResponseSchema(
      //   t.Omit(SelectUserSchema, ["password", "fcmToken"])
      // ),
    }
  )
  .get(
    "/search",
    async ({ userRepo, query: { query } }) => {
      console.log("QUERY", query);
      if (!query || query.length === 0) {
        const random = await userRepo.list();

        return {
          message: "Random user found",
          data: random,
        };
      }

      const users = await userRepo.search(query);

      return {
        message: "User found",
        data: users,
      };
    },
    {
      detail: {
        tags: ["USER"],
      },
      query: t.Object({
        query: t.Optional(t.String()),
      }),
      // response: APIResponseSchema(
      //   t.Array(t.Omit(SelectUserSchema, ["password", "fcmToken"]))
      // ),
    }
  )
  .get(
    "/find-username",
    async ({ userRepo, query: { username, email } }) => {
      const user = await userRepo.findByUsername(username);

      if (user.length === 0) {
        return {
          message: "User available",
        };
      }

      if (!email) email = `${username}@dot.com`;

      const suggestions = Array.from({ length: 5 }, (_, i) =>
        generateFromEmail(email, i + 55555)
      );

      const exists = await userRepo.findByManyUsername(suggestions);

      const usernameExists = new Set(exists.map((user) => user.username));

      const finalSuggestions = suggestions.map((suggestion, i) => {
        while (usernameExists.has(suggestion)) {
          suggestion = generateFromEmail(email, i + 55555);
        }
        return suggestion;
      });

      return {
        message: "Username not available",
        data: finalSuggestions,
      };
    },
    {
      detail: {
        tags: ["USER"],
      },
      query: t.Object({
        username: t.String(),
        email: t.Optional(t.String()),
      }),
      // response: APIResponseSchema(t.Array(t.String())),
    }
  )
  .put(
    "/update-fcm-token",
    async ({ userRepo, body, verifyJWT }) => {
      const data = body as any;
      const user = await verifyJWT();
      const updated = await userRepo.updateFcmToken(user.id, data.fcmToken);

      return {
        message: "FCM token updated",
        data: updated,
      };
    },
    {
      detail: {
        tags: ["USER"],
      },
      // body: t.Object({
      //   fcmToken: t.String(),
      // }),
      // response: APIResponseSchema(
      //   t.Omit(SelectUserSchema, ["password", "fcmToken"])
      // ),
    }
  );
