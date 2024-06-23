import { InsertQuestionSchema } from "~/schemas/exam/question";
import { ServerType } from "..";

export function createQuestionRouter(app: ServerType) {
  app.get("/", ({ query: { cursor, limit } }) => {});
  app.get("/:id", ({ params: { id } }) => {});
  app.post("/", () => {}, { body: InsertQuestionSchema });
  app.put("/:id", ({ params: { id } }) => {}, { body: InsertQuestionSchema });
  app.delete("/:id", ({ params: { id } }) => {});
  return app;
}
