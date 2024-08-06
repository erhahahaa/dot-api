import { Static, t, TSchema } from "elysia";

// Define the APIResponseSchema function
export const APIResponseSchema = <T extends TSchema>(T: T) =>
  t.Object({
    error: t.Optional(t.String()),
    message: t.Optional(t.String()),
    data: t.Optional(T),
  });

type APIResponseSchemaReturnType<T extends TSchema> = ReturnType<
  typeof APIResponseSchema<T>
>;

export type APIResponse<T extends TSchema> = Static<
  APIResponseSchemaReturnType<T>
>;

export const NullishSchema = t.Union([t.Null(), t.Undefined()]);
export type Nullish = Static<typeof NullishSchema>;
export type TypeOfNullish = typeof NullishSchema;
