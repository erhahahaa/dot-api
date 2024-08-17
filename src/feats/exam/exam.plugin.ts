import Elysia, { t } from "elysia";
import { Message } from "firebase-admin/messaging";
import { BucketService } from "../../core/services/bucket";
import { DEFAULT_IMAGE, MessagingService } from "../../core/services/fb";
import { AuthService } from "../auth/auth.service";
import { MediaType } from "../media/media.schema";
import { Dependency } from "./exam.dependency";
import { ExamExtended } from "./exam.schema";

export const ExamPlugin = new Elysia()
  .use(Dependency)
  .use(AuthService)
  .use(BucketService)
  .use(MessagingService)
  .get(
    "/",
    async ({ examRepo, query: { clubId } }) => {
      const evaluations = await examRepo.list({ clubId });

      return {
        message: "Found evaluations",
        data: evaluations,
      };
    },
    {
      detail: {
        tags: ["EXAM"],
      },
      query: t.Object({
        clubId: t.Number(),
      }),
      // response: APIResponseSchema(t.Array(SelectExamSchema)),
    }
  )
  .post(
    "/",
    async ({ examRepo, body }) => {
      const evaluation = await examRepo.create(body as any);
      return {
        message: "Evaluation created",
        data: evaluation,
      };
    },
    {
      detail: {
        tags: ["EXAM"],
      },
      // body: InsertExamSchema,
      // response: APIResponseSchema(SelectExamSchema),
      afterHandle: async ({ clubRepo, response, messenger }) => {
        if (!response) return;
        const { id, title, clubId } = (response as any).data as ExamExtended;
        if (!clubId) return;

        const club = await clubRepo.find(clubId);
        const topic = `clubs_${club.id}`;
        const body = `${title} exam is now available in ${club.name} club !`;
        const examTitle = "New Exam just dropped! 🎉";

        const data = {
          id: `club_${club.id}_exam_${id}`,
          type: "EXAM",
          title: examTitle,
          body: title,
        };

        const msg: Message = {
          notification: {
            title: examTitle,
            body: body,
            imageUrl: DEFAULT_IMAGE,
          },
          data,
          android: {
            notification: {
              title: examTitle,
              body: body,
              imageUrl: DEFAULT_IMAGE,
              sound: "default",
              priority: "high",
            },
            data,
          },
          topic,
        };

        await messenger.send(msg);
      },
    }
  )
  .get(
    "/:id",
    async ({ examRepo, params: { id } }) => {
      const evaluation = await examRepo.find(id);

      return {
        message: "Evaluation found",
        data: evaluation,
      };
    },
    {
      detail: {
        tags: ["EXAM"],
      },
      params: t.Object({
        id: t.Number(),
      }),
      // response: APIResponseSchema(SelectExamSchema),
    }
  )
  .put(
    "/:id",
    async ({ examRepo, params: { id }, body }) => {
      const evaluation = await examRepo.update({
        ...(body as any),
        id,
        updatedAt: new Date(),
      });
      return {
        message: "Evaluation updated",
        data: evaluation,
      };
    },
    {
      detail: {
        tags: ["EXAM"],
      },
      params: t.Object({
        id: t.Number(),
      }),
      // body: InsertExamSchema,
      // response: APIResponseSchema(SelectExamSchema),
    }
  )
  .delete(
    "/:id",
    async ({ examRepo, params: { id } }) => {
      const evaluation = await examRepo.delete(id);
      return {
        message: "Evaluation deleted",
        data: evaluation,
      };
    },
    {
      detail: {
        tags: ["EXAM"],
      },
      params: t.Object({
        id: t.Number(),
      }),
      // response: APIResponseSchema(SelectExamSchema),
    }
  )
  .put(
    "/:id/image",
    async ({
      examRepo,
      mediaRepo,
      params: { id },
      body,
      uploadFile,
      deleteFile,
    }) => {
      const data = body as any;
      const { mediaId, title } = await examRepo.find(id);

      const upload = await uploadFile({
        parent: "exam",
        blob: data.image,
      });

      const updateMedia = await mediaRepo.update({
        name: data.image.name,
        type: data.image.type as MediaType,
        parent: "exam",
        url: upload.url,
        path: upload.name,
      });

      const exam = await examRepo.update({
        title,
        mediaId: updateMedia.id,
      });

      if (mediaId) {
        const { path } = await mediaRepo.find(mediaId);
        if (path) await deleteFile({ parent: "exam", path: path });
      }

      return {
        message: "Exam image updated",
        data: exam,
      };
    },
    {
      detail: {
        tags: ["EXAM"],
      },
      params: t.Object({
        id: t.Number(),
      }),
      // body: t.Object({
      //   image: t.File(),
      // }),
      // response: APIResponseSchema(t.Object({})),
    }
  );
