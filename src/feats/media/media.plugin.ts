import Elysia, { t } from "elysia";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { GlobalDependency } from "../../core/di";
import { APIResponseSchema } from "../../core/response";
import { BucketService } from "../../core/services/bucket";
import { AuthService } from "../auth/auth.service";
import {
  InsertMediaSchema,
  MediaType,
  SelectMediaSchema,
} from "./media.schema";

export const MediaPlugin = new Elysia({
  name: "Day of Training Media API",
  tags: ["MEDIA"],
})
  .use(GlobalDependency)
  .use(AuthService)
  .use(BucketService)
  .model("media.response", APIResponseSchema(SelectMediaSchema))
  .model(
    "media.dir.param",
    t.Object({ dir: InsertMediaSchema.properties.parent })
  )
  .get(
    "/:dir",
    async ({ mediaRepo, query: { clubId, type }, params: { dir } }) => {
      let types: MediaType[] | undefined = undefined;
      if (type?.includes("image")) {
        types = ["image/png", "image/jpg", "image/jpeg", "image/svg+xml"];
      }

      const medias = await mediaRepo.list({
        clubId: clubId,
        parent: dir,
        types,
      });

      return {
        message: "Media list",
        data: medias,
      };
    },
    {
      query: t.Object({
        clubId: t.Number(),
        type: t.Optional(t.String()),
      }),
      params: "media.dir.param",
      response: { 200: APIResponseSchema(t.Array(SelectMediaSchema)) },
    }
  )
  .post(
    "/:dir",
    async ({
      mediaRepo,
      clubRepo,
      body,
      verifyJWT,
      params: { dir },
      query: { clubId },
      uploadFile,
    }) => {
      const user = await verifyJWT();

      const findClub = await clubRepo.find(clubId);

      const upload = await uploadFile({
        parent: dir,
        blob: body.file,
      });

      let media = await mediaRepo.create({
        creatorId: user.id,
        clubId: findClub.id,
        name: body.file.name,
        fileSize: body.file.size,
        path: upload.name,
        type: body.file.type as MediaType,
        parent: dir,
        url: upload.url,
      });

      if (!fs.existsSync("tmp")) {
        fs.mkdirSync("tmp");
      }

      if (body.file.type === "video/mp4") {
        media = await new Promise((resolve, reject) => {
          ffmpeg.ffprobe(upload.url, (err, metadata) => {
            if (err) {
              console.log("Error in getting metadata", err);
              return;
            }

            const width = metadata.streams[0].width ?? 0;
            const height = metadata.streams[0].height ?? 0;
            let size = "640x360";
            if (width > 640) {
              const ratio = width / height;
              size = `640x${Math.floor(640 / ratio)}`;
            }
            ffmpeg(upload.url)
              .screenshots({
                count: 1,
                folder: "tmp",
                filename: `${upload.name}.png`,
                timestamps: ["00:00:01"],
                size: size,
              })
              .on("end", async () => {
                const thumbPath = path.join("tmp", `${upload.name}.png`);
                const thumbBlob = fs.readFileSync(thumbPath);
                const file = new File([thumbBlob], `thumb_${upload.name}.png`, {
                  type: "image/png",
                });
                const thumbUpload = await uploadFile({
                  parent: dir,
                  blob: file,
                  withUniqueName: false,
                });

                const thumb = await mediaRepo.update({
                  id: media.id,
                  thumbPath: thumbUpload.name,
                  thumbUrl: thumbUpload.url,
                  name: media.name,
                  type: media.type,
                  parent: media.parent,
                  url: media.url,
                  path: media.path,
                  aspectRatio: width / height,
                  width: width,
                  height: height,
                });

                fs.unlinkSync(thumbPath);

                resolve(thumb);
              })
              .on("error", (err) => {
                console.log("Error in taking screenshots", err);
                reject(err);
              });
          });
        });
      }
      if (body.file.type.includes("image")) {
        const metadata = await sharp(await body.file.arrayBuffer()).metadata();
        const thumb = await sharp(await body.file.arrayBuffer())
          .resize(200, 200)
          .toBuffer();

        const file = new File([thumb], `thumb_${upload.name}`, {
          type: "image/png",
        });

        const thumbUpload = await uploadFile({
          parent: dir,
          blob: file,
          withUniqueName: false,
        });

        media = await mediaRepo.update({
          id: media.id,
          thumbPath: thumbUpload.name,
          thumbUrl: thumbUpload.url,
          name: media.name,
          type: media.type,
          parent: media.parent,
          url: media.url,
          aspectRatio: (metadata.width ?? 0) / (metadata.height ?? 0),
          width: metadata.width,
          height: metadata.height,
        });
      }

      return {
        message: "Media uploaded",
        data: media,
      };
    },
    {
      query: t.Object({
        clubId: t.Number(),
      }),
      params: "media.dir.param",
      body: t.Object({
        file: t.File({
          maxSize: "1024m", // 1GBkkkc
        }),
      }),
      response: { 200: "media.response" },
    }
  )
  .put(
    "/:dir/:id",
    async ({
      mediaRepo,
      params: { id, dir },
      body,
      uploadFile,
      deleteFile,
    }) => {
      const { path } = await mediaRepo.find(id);

      if (path) {
        await mediaRepo.delete(id);
        await deleteFile({ parent: dir, path });
      }

      const upload = await uploadFile({
        parent: dir,
        blob: body.file,
      });

      const media = await mediaRepo.update({
        ...body,
        id: id,
        parent: dir,
        path: upload.name,
        name: body.file.name,
        type: body.file.type as MediaType,
        url: upload.url,
      });

      return {
        message: "Media updated",
        data: media,
      };
    },
    {
      params: t.Object({
        id: t.Number(),
        dir: InsertMediaSchema.properties.parent,
      }),
      body: t.Object({
        file: t.File(),
      }),
      response: { 200: "media.response" },
    }
  );
