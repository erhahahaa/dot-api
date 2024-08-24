import { and, eq, SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { BadRequestError, ServerError } from "../../core/errors";
import { BaseRepo } from "../../core/repo";
import { DrizzlePostgres } from "../../core/services/db";
import { ExamModel } from "../exam/exam.model";
import { QuestionModel } from "../question/question.model";
import { UserModel } from "../user/user.model";
import { EvaluationModel } from "./evaluation.model";
import { Evaluation, InsertEvaluation } from "./evaluation.schema";

abstract class EvaluationRepo extends BaseRepo<Evaluation> {}

export class EvaluationRepoImpl extends EvaluationRepo {
  private db: DrizzlePostgres;

  constructor(db: DrizzlePostgres) {
    super();
    this.db = db;
  }

  private select(where: SQL<unknown> | undefined) {
    const Coach = alias(UserModel, "coach");
    const Athlete = alias(UserModel, "athlete");
    return this.db
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
          id: ExamModel.id,
          clubId: ExamModel.clubId,
          mediaId: ExamModel.mediaId,
          title: ExamModel.title,
          description: ExamModel.description,
          dueAt: ExamModel.dueAt,
        },
        athlete: {
          id: Athlete.id,
          name: Athlete.name,
          email: Athlete.email,
          bornDate: Athlete.bornDate,
        },
        coach: {
          id: Coach.id,
          name: Coach.name,
          email: Coach.email,
          bornDate: Coach.bornDate,
        },
      })
      .from(EvaluationModel)
      .leftJoin(ExamModel, eq(EvaluationModel.examId, ExamModel.id))
      .leftJoin(Coach, eq(EvaluationModel.athleteId, Coach.id))
      .leftJoin(Athlete, eq(EvaluationModel.coachId, Athlete.id))
      .where(where);
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

    return evaluations[0];
  }

  async list({
    examId,
    userId,
  }: {
    examId: number;
    userId?: number;
  }): Promise<any[]> {
    const evaluations = await this.select(
      userId
        ? and(
            eq(EvaluationModel.athleteId, userId),
            eq(EvaluationModel.examId, examId)
          )
        : eq(EvaluationModel.examId, examId)
    );

    const updatedEvaluations = await Promise.all(
      evaluations.map(async (evaluation) => {
        if (!evaluation.evaluations) return evaluation;

        const updatedQuestionEvaluations = await Promise.all(
          evaluation.evaluations.map(async (questionEvaluation) => {
            if (!questionEvaluation.questionId) return questionEvaluation;

            const [question] = await this.db
              .select()
              .from(QuestionModel)
              .where(eq(QuestionModel.id, questionEvaluation.questionId));

            if (question) {
              return { ...questionEvaluation, questionName: question.question };
            }
            return questionEvaluation;
          })
        );

        return { ...evaluation, evaluations: updatedQuestionEvaluations };
      })
    );

    console.log(updatedEvaluations);
    return updatedEvaluations;
  }
}
