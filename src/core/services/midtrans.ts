import Elysia from "elysia";
import { Snap } from "midtrans-client-typescript/dist/lib/snap";
import { env } from "../../utils/env";

const snap = new Snap({
  isProduction: false,
  clientKey: env.DEV_MIDTRANS_CLIENT_KEY,
  serverKey: env.DEV_MIDTRANS_SERVER_KEY,
});
export const PaymentService = new Elysia().derive({ as: "scoped" }, () => ({
  async createTransaction({
    orderId,
    grossAmount,
    customerDetails,
    itemDetails,
  }: {
    orderId: number;
    grossAmount: number;
    customerDetails: {
      name: string;
      email: string;
    };
    itemDetails: {
      id: number;
      price: number;
      quantity: number;
      name: string;
    }[];
  }) {
    return await snap.createTransaction({
      transactionDetails: {
        orderId,
        grossAmount,
      },
      creditCard: {
        secure: true,
      },
      customerDetails,
      itemDetails,
    });
  },
}));
