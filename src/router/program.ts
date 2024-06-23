import { InsertProgramSchema } from "~/schemas/programs";
import { ServerType } from "..";

export function createProgramRouter(app: ServerType) {
  app.get("/", ({ query: { cursor, limit } }) => {});
  app.get("/:id", ({ params: { id } }) => {});
  app.post("/", ({ jwt, cookie: { auth } }) => {}, {
    body: InsertProgramSchema,
  });
  app.put("/:id", ({ params: { id } }) => {}, { body: InsertProgramSchema });
  app.delete("/:id", ({ params: { id } }) => {}, {});
  return app;
}
