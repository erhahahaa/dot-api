import Elysia, { t } from "elysia";
import { Message } from "firebase-admin/messaging";
import { GlobalDependency } from "../../core/di";
import { APIResponseSchema } from "../../core/response";
import { BucketService } from "../../core/services/bucket";
import { DEFAULT_IMAGE, MessagingService } from "../../core/services/fb";
import { IdParam } from "../../utils/param";
import { AuthService } from "../auth/auth.service";
import { MediaType } from "../media/media.schema";
import {
  ExamExtended,
  ExamExtendedSchema,
  InsertExamSchema,
} from "./exam.schema";

export const ExamPlugin = new Elysia({
  name: "Day of Training Exam API",
  tags: ["EXAM"],
})
  .use(GlobalDependency)
  .use(AuthService)
  .use(BucketService)
  .use(MessagingService)
  .model("exam.insert", InsertExamSchema)
  .model("exam.response", APIResponseSchema(ExamExtendedSchema))
  .use(IdParam)
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
      query: t.Object({
        clubId: t.Number(),
      }),
      response: APIResponseSchema(t.Array(ExamExtendedSchema)),
    }
  )
  .post(
    "/",
    async ({ examRepo, body }) => {
      const evaluation = await examRepo.create(body);
      return {
        message: "Evaluation created",
        data: evaluation,
      };
    },
    {
      body: "exam.insert",
      response: { 200: "exam.response" },
      afterHandle: async ({ clubRepo, response, messenger }) => {
        if (!response) return;
        const res = (response as any).data as ExamExtended;
        const { id, title, clubId } = res;
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
      params: "id.param",
      response: { 200: "exam.response" },
    }
  )
  .put(
    "/:id",
    async ({ examRepo, params: { id }, body }) => {
      const evaluation = await examRepo.update({
        ...body,
        id,
        updatedAt: new Date(),
      });
      return {
        message: "Evaluation updated",
        data: evaluation,
      };
    },
    {
      params: "id.param",
      body: "exam.insert",
      response: { 200: "exam.response" },
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
      params: "id.param",
      response: { 200: "exam.response" },
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
      const { mediaId, title } = await examRepo.find(id);

      const upload = await uploadFile({
        parent: "exam",
        blob: body.image,
      });

      const updateMedia = await mediaRepo.update({
        name: body.image.name,
        type: body.image.type as MediaType,
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
      params: "id.param",
      body: t.Object({
        image: t.File(),
      }),
      response: { 200: "exam.response" },
    }
  );
