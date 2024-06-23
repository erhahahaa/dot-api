import { InsertExamSchema } from "~/schemas/exam";
import { ServerType } from "..";

export function createExamRouter(app: ServerType) {
  app.get("/", ({ query: { cursor, limit } }) => {});
  app.get("/:id", ({ params: { id } }) => {});
  app.post("/", () => {}, { body: InsertExamSchema });
  app.put("/:id", ({ params: { id } }) => {}, { body: InsertExamSchema });
  app.delete("/:id", ({ params: { id } }) => {});
  return app;
}
