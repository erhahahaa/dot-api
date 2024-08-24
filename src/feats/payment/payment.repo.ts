import { eq } from "drizzle-orm";
import { BadRequestError, ServerError } from "../../core/errors";
import { BaseRepo } from "../../core/repo";
import { DrizzlePostgres } from "../../core/services/db";
import { PaymentModel } from "./payment.model";
import { InsertPayment, Payment } from "./payment.schema";

abstract class PaymentRepo extends BaseRepo<Payment> {}

export class PaymentRepoImpl extends PaymentRepo {
  private db: DrizzlePostgres;

  constructor(db: DrizzlePostgres) {
    super();
    this.db = db;
  }

  async create(data: InsertPayment): Promise<Payment> {
    const payment = await this.db.insert(PaymentModel).values(data).returning();

    if (payment.length == 0) {
      throw new ServerError("Failed to create payment");
    }

    return payment[0];
  }

  async update(data: InsertPayment): Promise<Payment> {
    if (!data.id) throw new BadRequestError("Payment id is required");
    const payment = await this.db
      .update(PaymentModel)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(PaymentModel.id, data.id))
      .returning();

    if (payment.length == 0) {
      throw new ServerError("Failed to update payment");
    }

    return payment[0];
  }
  delete(id: number): Promise<Payment> {
    throw new Error("Method not implemented.");
  }
  async find(id: number): Promise<Payment> {
    const payment = await this.db
      .select()
      .from(PaymentModel)
      .where(eq(PaymentModel.id, id));

    if (payment.length == 0) {
      throw new ServerError("Payment not found");
    }

    return payment[0];
  }
  async list({ userId }: { userId: number }): Promise<Payment[]> {
    const payments = await this.db
      .select()
      .from(PaymentModel)
      .where(eq(PaymentModel.userId, userId));

    return payments;
  }
}
