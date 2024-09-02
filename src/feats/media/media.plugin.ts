import Elysia, { t } from "elysia";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { GlobalDependency } from "../../core/di";
import { BucketService } from "../../core/services/bucket";
import { AuthService } from "../auth/auth.service";
import { InsertMediaSchema, MediaType } from "./media.schema";

export const MediaPlugin = new Elysia()
  .use(GlobalDependency)
  .use(AuthService)
  .use(BucketService)
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
      detail: {
        tags: ["MEDIA"],
      },
      query: t.Object({
        clubId: t.Number(),
        type: t.Optional(t.String()),
      }),
      params: t.Object({
        dir: InsertMediaSchema.properties.parent,
      }),

      // response: APIResponseSchema(t.Array(SelectMediaSchema)),
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
      const data = body as any;
      const user = await verifyJWT();

      const findClub = await clubRepo.find(clubId);

      const upload = await uploadFile({
        parent: dir,
        blob: data.file,
      });

      let media = await mediaRepo.create({
        creatorId: user.id,
        clubId: findClub.id,
        name: data.file.name,
        fileSize: data.file.size,
        path: upload.name,
        type: data.file.type as MediaType,
        parent: dir,
        url: upload.url,
      });

      // create tmp folder if not exist
      if (!fs.existsSync("tmp")) {
        fs.mkdirSync("tmp");
      }

      if (data.file.type === "video/mp4") {
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
      if (data.file.type.includes("image")) {
        const metadata = await sharp(await data.file.arrayBuffer()).metadata();
        const thumb = await sharp(await data.file.arrayBuffer())
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
      detail: {
        tags: ["MEDIA"],
      },
      query: t.Object({
        clubId: t.Number(),
      }),
      params: t.Object({
        dir: InsertMediaSchema.properties.parent,
      }),
      body: t.Object({
        file: t.File({
          maxSize: "1024m", // 1GBkkkc
        }),
      }),
      // response: APIResponseSchema(SelectMediaSchema),
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
      const data = body as any;
      const { path } = await mediaRepo.find(id);

      if (path) {
        await mediaRepo.delete(id);
        await deleteFile({ parent: dir, path });
      }

      const upload = await uploadFile({
        parent: dir,
        blob: data.file,
      });

      const media = await mediaRepo.update({
        ...data,
        id: id,
        parent: dir,
        path: upload.name,
        name: data.file.name,
        type: data.file.type as MediaType,
        url: upload.url,
      });

      return {
        message: "Media updated",
        data: media,
      };
    },
    {
      detail: {
        tags: ["MEDIA"],
      },
      params: t.Object({
        id: t.Number(),
        dir: InsertMediaSchema.properties.parent,
      }),
      // body: t.Object({
      //   file: t.File(),
      // }),
      // response: APIResponseSchema(SelectMediaSchema),
    }
  );
