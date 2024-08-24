import Elysia from "elysia";
import { GlobalDependency } from "../../core/di";
import { BadRequestError } from "../../core/errors";
import { PaymentService } from "../../core/services/midtrans";
import { AuthService } from "../auth/auth.service";
import { InsertPaymentSchema } from "./payment.schema";

export const PaymentPlugin = new Elysia()
  .use(AuthService)
  .use(PaymentService)
  .use(GlobalDependency)
  .post(
    "/new",
    async ({ body, verifyJWT, createTransaction, paymentRepo }) => {
      const user = await verifyJWT();
      if (!body.clubId) throw new BadRequestError("Club ID is required");
      const order = await paymentRepo.create(body);
      return await createTransaction({
        orderId: order.id,
        grossAmount: order.amount,
        customerDetails: {
          name: user.name,
          email: user.email,
        },
        itemDetails: [
          {
            id: order.id,
            price: order.amount,
            quantity: 1,
            name: "Membership",
          },
        ],
      });
    },
    {
      detail: {
        tags: ["PAYMENT"],
      },
      body: InsertPaymentSchema,
    }
  );
