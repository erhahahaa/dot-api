import { eq, SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import {
  BadRequestError,
  NoContentError,
  ServerError,
} from "../../core/errors";
import { BaseRepo } from "../../core/repo";
import { DrizzlePostgres } from "../../core/services/db";
import { ExamModel } from "../exam";
import { UserModel } from "../user/user.model";
import { EvaluationModel } from "./evaluation.model";
import {
  Evaluation,
  EvaluationExtended,
  InsertEvaluation,
} from "./evaluation.schema";

abstract class EvaluationRepo extends BaseRepo<Evaluation> {}

export class EvaluationRepoImpl extends EvaluationRepo {
  private db: DrizzlePostgres;

  constructor(db: DrizzlePostgres) {
    super();
    this.db = db;
  }

  private select(where: SQL<unknown>) {
    const Coach = alias(UserModel, "coach");
    const Athlete = alias(UserModel, "athlete");
    return (
      this.db
        .select({
          id: EvaluationModel.id,
          clubId: EvaluationModel.clubId,
          examId: EvaluationModel.examId,
          athleteId: EvaluationModel.athleteId,
          coachId: EvaluationModel.coachId,
          evaluations: EvaluationModel.evaluations,
          createdAt: EvaluationModel.createdAt,
          updatedAt: EvaluationModel.updatedAt,
          // club: ClubModel,
          exam: {
            title: ExamModel.title,
          },
          athlete: {
            name: Athlete.name,
          },
          coach: {
            name: Coach.name,
          },
        })
        .from(EvaluationModel)
        // .leftJoin(ClubModel, eq(EvaluationModel.clubId, ClubModel.id))
        .leftJoin(ExamModel, eq(EvaluationModel.examId, ExamModel.id))
        .leftJoin(Coach, eq(EvaluationModel.athleteId, Coach.id))
        .leftJoin(Athlete, eq(EvaluationModel.coachId, Athlete.id))
        .where(where)
    );
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

  async list({ examId }: { examId: number }): Promise<EvaluationExtended[]> {
    const evaluations = await this.select(eq(EvaluationModel.examId, examId));

    if (evaluations.length === 0)
      throw new NoContentError("No evaluation found");

    return evaluations;
  }
}
