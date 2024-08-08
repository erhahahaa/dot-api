import { eq } from "drizzle-orm";
import {
  BadRequestError,
  NoContentError,
  ServerError,
} from "../../core/errors";
import { BaseRepo } from "../../core/repo";
import { DrizzlePostgres } from "../../core/services/db";
import { MediaModel } from "../media/media.model";
import { ExamModel } from "./exam.model";
import { Exam, ExamExtended, InsertExam } from "./exam.schema";

abstract class ExamRepo extends BaseRepo<ExamExtended> {}

export class ExamRepoImpl extends ExamRepo {
  private db: DrizzlePostgres;

  constructor(db: DrizzlePostgres) {
    super();
    this.db = db;
  }

  private select(where: any): Promise<ExamExtended[]> {
    return this.db
      .select({
        id: ExamModel.id,
        clubId: ExamModel.clubId,
        mediaId: ExamModel.mediaId,
        title: ExamModel.title,
        description: ExamModel.description,
        dueAt: ExamModel.dueAt,
        createdAt: ExamModel.createdAt,
        updatedAt: ExamModel.updatedAt,
        media: MediaModel,
      })
      .from(ExamModel)
      .leftJoin(MediaModel, eq(ExamModel.mediaId, MediaModel.id))
      .where(where);
  }

  async create(data: InsertExam): Promise<ExamExtended> {
    const exams = await this.db
      .insert(ExamModel)
      .values({
        ...data,
        dueAt: new Date(data.dueAt || new Date()),
      })
      .returning()
      .then(async (rows) => await this.select(eq(ExamModel.id, rows[0].id)));

    if (exams.length === 0) throw new ServerError("Failed to create exam");

    return exams[0];
  }

  async update(data: InsertExam): Promise<ExamExtended> {
    if (!data.id) throw new BadRequestError("Exam id is required");

    const updateExam = await this.db
      .update(ExamModel)
      .set({
        ...data,
        dueAt: new Date(data.dueAt || new Date()),
      })
      .where(eq(ExamModel.id, data.id))
      .returning();

    if (updateExam.length === 0) throw new ServerError("Failed to update exam");

    const exams = await this.select(eq(ExamModel.id, data.id));

    return exams[0];
  }

  async delete(id: number): Promise<Exam> {
    const exams = await this.db
      .delete(ExamModel)
      .where(eq(ExamModel.id, id))
      .returning();

    if (exams.length === 0) throw new ServerError("Failed to delete exam");

    return exams[0];
  }

  async find(id: number): Promise<ExamExtended> {
    const exams = await this.select(eq(ExamModel.id, id));

    if (exams.length === 0) throw new NoContentError("Exam not found");

    return exams[0];
  }

  async list({ clubId }: { clubId: number }): Promise<ExamExtended[]> {
    const exams = await this.select(eq(ExamModel.clubId, clubId));

    if (exams.length === 0) throw new NoContentError("No exam found");

    return exams;
  }
}
