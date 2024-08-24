import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static } from "elysia";
import { PaymentModel } from "./payment.model";

export const InsertPaymentSchema = createInsertSchema(PaymentModel, {});
export const SelectPaymentSchema = createSelectSchema(PaymentModel, {});

export type Payment = Static<typeof SelectPaymentSchema>;
export type InsertPayment = Static<typeof InsertPaymentSchema>;
