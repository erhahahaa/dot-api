import { eq } from "drizzle-orm";
import {
  BadRequestError,
  NoContentError,
  ServerError,
} from "../../core/errors";
import { BaseRepo } from "../../core/repo";
import { DrizzlePostgres } from "../../core/services/db";
import { EvaluationModel } from "./evaluation.model";
import { Evaluation, InsertEvaluation } from "./evaluation.schema";

abstract class EvaluationRepo extends BaseRepo<Evaluation> {}

export class EvaluationRepoImpl extends EvaluationRepo {
  private db: DrizzlePostgres;

  constructor(db: DrizzlePostgres) {
    super();
    this.db = db;
  }

  async create(data: InsertEvaluation): Promise<Evaluation> {
    const evaluations = await this.db
      .insert(EvaluationModel)
      .values(data)
      .returning();

    if (evaluations.length === 0)
      throw new ServerError("Failed to create evaluation");

    return evaluations[0];
  }

  async update(data: InsertEvaluation): Promise<Evaluation> {
    if (!data.id) throw new BadRequestError("Evaluation id is required");

    const evaluations = await this.db
      .update(EvaluationModel)
      .set(data)
      .where(eq(EvaluationModel.id, data.id))
      .returning();

    if (evaluations.length === 0)
      throw new ServerError("Failed to update evaluation");

    return evaluations[0];
  }

  async delete(id: number): Promise<Evaluation> {
    const evaluations = await this.db
      .delete(EvaluationModel)
      .where(eq(EvaluationModel.id, id))
      .returning();

    if (evaluations.length === 0)
      throw new ServerError("Failed to delete evaluation");

    return evaluations[0];
  }

  async find(id: number): Promise<Evaluation> {
    const evaluations = await this.db
      .select()
      .from(EvaluationModel)
      .where(eq(EvaluationModel.id, id));

    if (evaluations.length === 0)
      throw new NoContentError("Evaluation not found");

    return evaluations[0];
  }

  async list({ examId }: { examId: number }): Promise<Evaluation[]> {
    const evaluations = await this.db
      .select()
      .from(EvaluationModel)
      .where(eq(EvaluationModel.examId, examId));

    if (evaluations.length === 0)
      throw new NoContentError("No evaluation found");

    return evaluations;
  }
}
