import Elysia, { t } from "elysia";

export const IdParam = new Elysia({
  name: "ID Param",
}).model("id.param", t.Object({ id: t.Number() }));
