import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static } from "elysia";
import { EvaluationModel } from "./evaluation.model";

export const InsertEvaluationSchema = createInsertSchema(EvaluationModel, {});
export const SelectEvaluationSchema = createSelectSchema(EvaluationModel, {});

export type Evaluation = Static<typeof SelectEvaluationSchema>;
export type InsertEvaluation = Static<typeof InsertEvaluationSchema>;
