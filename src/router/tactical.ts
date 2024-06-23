import { InsertTacticalSchema } from "~/schemas/tacticals";
import { ServerType } from "..";

export function createTacticalRouter(app: ServerType) {
  app.get("/", ({ query: { cursor, limit } }) => {});
  app.get("/:id", ({ params: { id } }) => {});
  app.post("/", () => {}, { body: InsertTacticalSchema });
  app.put("/:id", ({ params: { id } }) => {}, { body: InsertTacticalSchema });
  app.delete("/:id", ({ params: { id } }) => {});
  return app;
}
