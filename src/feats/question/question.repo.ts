import { SQL, eq, inArray } from "drizzle-orm";
import {
  BadRequestError,
  NoContentError,
  ServerError,
} from "../../core/errors";
import { BaseRepo } from "../../core/repo";
import { DrizzlePostgres } from "../../core/services/db";
import { ExamModel } from "../exam/exam.model";
import { MediaModel } from "../media/media.model";
import { QuestionModel } from "./question.model";
import { InsertQuestion, Question, QuestionExtended } from "./question.schema";

abstract class QuestionRepo extends BaseRepo<QuestionExtended> {
  abstract createBulk(data: InsertQuestion[]): Promise<QuestionExtended[]>;
  abstract updateBulk(data: InsertQuestion[]): Promise<QuestionExtended[]>;
}

export class QuestionRepoImpl extends QuestionRepo {
  private db: DrizzlePostgres;

  constructor(db: DrizzlePostgres) {
    super();
    this.db = db;
  }

  private select(where: SQL<unknown>): Promise<QuestionExtended[]> {
    return this.db
      .select({
        id: QuestionModel.id,
        examId: QuestionModel.examId,
        mediaId: QuestionModel.mediaId,
        order: QuestionModel.order,
        type: QuestionModel.type,
        question: QuestionModel.question,
        options: QuestionModel.options,
        createdAt: QuestionModel.createdAt,
        updatedAt: QuestionModel.updatedAt,
        media: MediaModel,
      })
      .from(QuestionModel)
      .leftJoin(MediaModel, eq(QuestionModel.mediaId, MediaModel.id))
      .where(where);
  }

  async create(data: InsertQuestion): Promise<QuestionExtended> {
    const questions = await this.db
      .insert(QuestionModel)
      .values(data)
      .returning()
      .then((rows) => this.select(eq(QuestionModel.id, rows[0].id)));

    if (questions.length === 0)
      throw new ServerError("Failed to create question");

    return questions[0];
  }

  async createBulk(data: InsertQuestion[]): Promise<QuestionExtended[]> {
    let examIds: number[] = [];

    data.forEach((question) => {
      if (!question.examId) throw new BadRequestError("Exam id is required");
      if (!examIds.includes(question.examId)) examIds.push(question.examId);
    });

    const _questions = await this.db
      .insert(QuestionModel)
      .values(data)
      .returning();

    if (_questions.length === 0)
      throw new ServerError("Failed to create questions");

    const questionIds: number[] = _questions.map((q) => q.id);

    const questions = await this.select(inArray(QuestionModel.id, questionIds));

    return questions;
  }

  async update(data: InsertQuestion): Promise<QuestionExtended> {
    if (!data.id) throw new BadRequestError("Question id is required");

    const updateQuestion = await this.db
      .update(QuestionModel)
      .set(data)
      .where(eq(QuestionModel.id, data.id))
      .returning();

    if (updateQuestion.length === 0)
      throw new ServerError("Failed to update question");

    const questions = await this.select(eq(QuestionModel.id, data.id));

    return questions[0];
  }

  async updateBulk(data: InsertQuestion[]): Promise<QuestionExtended[]> {
    let examIds: number[] = [];

    data.forEach((question) => {
      if (!question.examId) throw new BadRequestError("Exam id is required");
      if (!examIds.includes(question.examId)) examIds.push(question.examId);
    });

    const finds = await this.db
      .select()
      .from(ExamModel)
      .where(inArray(ExamModel.id, examIds));

    examIds.forEach((examId) => {
      const find = finds.find((f) => f.id === examId);
      if (!find) throw new BadRequestError(`Exam with id ${examId} not found`);
    });

    const updatePromises: Promise<any>[] = [];

    data.forEach((question) => {
      const updatePromise = this.db
        .update(QuestionModel)
        .set({
          ...question,
          updatedAt: new Date(),
        })
        .where(eq(QuestionModel.id, question.id ?? 0))
        .returning()
        .then((rows) => this.select(eq(QuestionModel.id, rows[0].id)));

      updatePromises.push(updatePromise);
    });

    const questions = await Promise.all(updatePromises);

    if (questions.length === 0)
      throw new ServerError("Failed to update questions");

    return questions.map((q) => q[0]);
  }

  async delete(id: number): Promise<QuestionExtended> {
    const questions = await this.db
      .delete(QuestionModel)
      .where(eq(QuestionModel.id, id))
      .returning();

    if (questions.length === 0)
      throw new ServerError("Failed to delete question");

    return questions[0];
  }

  async find(id: number): Promise<QuestionExtended> {
    const questions = await this.select(eq(QuestionModel.id, id));

    if (questions.length === 0) throw new NoContentError("Question not found");

    return questions[0];
  }

  async list({ examId }: { examId: number }): Promise<Question[]> {
    const questions = await this.select(eq(QuestionModel.examId, examId));

    if (questions.length === 0) throw new NoContentError("No question found");

    return questions;
  }
}
