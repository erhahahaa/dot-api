import { SQL, eq } from "drizzle-orm";
import { BadRequestError, ServerError } from "../../core/errors";
import { BaseRepo } from "../../core/repo";
import { DrizzlePostgres } from "../../core/services/db";
import { MediaModel } from "../media/media.model";
import { ProgramModel } from "./program.model";
import { InsertProgram, ProgramExtended } from "./program.schema";

abstract class ProgramRepo extends BaseRepo<ProgramExtended> {}

export class ProgramRepoImpl extends ProgramRepo {
  private db: DrizzlePostgres;

  constructor(db: DrizzlePostgres) {
    super();
    this.db = db;
  }

  private select(where: SQL<unknown>): Promise<ProgramExtended[]> {
    return this.db.query.ProgramModel.findMany({
      with: {
        media: true,
      },
      where,
    });
    return this.db
      .select({
        id: ProgramModel.id,
        clubId: ProgramModel.clubId,
        mediaId: ProgramModel.mediaId,
        name: ProgramModel.name,
        startDate: ProgramModel.startDate,
        endDate: ProgramModel.endDate,
        createdAt: ProgramModel.createdAt,
        updatedAt: ProgramModel.updatedAt,
        media: MediaModel,
      })
      .from(ProgramModel)
      .leftJoin(MediaModel, eq(ProgramModel.mediaId, MediaModel.id))
      .where(where);
  }

  async create(data: InsertProgram): Promise<ProgramExtended> {
    const programs = await this.db
      .insert(ProgramModel)
      .values({
        ...data,
        startDate: new Date(data.startDate || new Date()),
        endDate: new Date(data.endDate || new Date()),
      })
      .returning()
      .then((rows) => this.select(eq(ProgramModel.id, rows[0].id)));

    if (programs.length === 0)
      throw new ServerError("Failed to create program");

    return programs[0];
  }

  async update(data: InsertProgram): Promise<ProgramExtended> {
    if (!data.id) throw new BadRequestError("Program id is required");

    const updateProgram = await this.db
      .update(ProgramModel)
      .set({
        ...data,
        startDate: new Date(data.startDate || new Date()),
        endDate: new Date(data.endDate || new Date()),
      })
      .where(eq(ProgramModel.id, data.id))
      .returning();

    if (updateProgram.length === 0)
      throw new ServerError("Failed to update program");

    const programs = await this.select(eq(ProgramModel.id, data.id));

    return programs[0];
  }

  async delete(id: number): Promise<ProgramExtended> {
    const programs = await this.db
      .delete(ProgramModel)
      .where(eq(ProgramModel.id, id))
      .returning();

    if (programs.length === 0)
      throw new ServerError("Failed to delete program");

    return programs[0];
  }

  async find(id: number): Promise<ProgramExtended> {
    const programs = await this.select(eq(ProgramModel.id, id));

    return programs[0];
  }

  async list({ clubId }: { clubId: number }): Promise<ProgramExtended[]> {
    const programs = await this.select(eq(ProgramModel.clubId, clubId));

    return programs;
  }
}
