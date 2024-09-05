import { SQL, eq, inArray } from "drizzle-orm";
import { BadRequestError, ServerError } from "../../core/errors";
import { BaseRepo } from "../../core/repo";
import { DrizzlePostgres } from "../../core/services/db";
import { MediaModel } from "../media/media.model";
import { ExerciseModel } from "./exercise.model";
import { ExerciseExtended, InsertExercise } from "./exercise.schema";

abstract class ExerciseRepo extends BaseRepo<ExerciseExtended> {
  abstract createBulk(data: InsertExercise[]): Promise<ExerciseExtended[]>;
  abstract updateBulk(data: InsertExercise[]): Promise<ExerciseExtended[]>;
}

export class ExerciseRepoImpl extends ExerciseRepo {
  private db: DrizzlePostgres;

  constructor(db: DrizzlePostgres) {
    super();
    this.db = db;
  }

  private select(where: SQL<unknown>) {
    return this.db.query.ExerciseModel.findMany({
      with: {
        media: true,
      },
      where,
    });

    return this.db
      .select({
        id: ExerciseModel.id,
        programId: ExerciseModel.programId,
        mediaId: ExerciseModel.mediaId,
        order: ExerciseModel.order,
        name: ExerciseModel.name,
        description: ExerciseModel.description,
        repetition: ExerciseModel.repetition,
        sets: ExerciseModel.sets,
        rest: ExerciseModel.rest,
        tempo: ExerciseModel.tempo,
        intensity: ExerciseModel.intensity,
        createdAt: ExerciseModel.createdAt,
        updatedAt: ExerciseModel.updatedAt,
        media: MediaModel,
      })
      .from(ExerciseModel)
      .leftJoin(MediaModel, eq(ExerciseModel.mediaId, MediaModel.id))
      .where(where);
  }

  async create(data: InsertExercise): Promise<ExerciseExtended> {
    const exercises = await this.db
      .insert(ExerciseModel)
      .values(data)
      .returning()
      .then((rows) => this.select(eq(ExerciseModel.id, rows[0].id)));

    if (exercises.length === 0)
      throw new ServerError("Failed to create exercise");

    return exercises[0];
  }

  async createBulk(data: InsertExercise[]): Promise<ExerciseExtended[]> {
    let programiIds: number[] = [];

    data.forEach((exercise) => {
      if (!exercise.programId)
        throw new BadRequestError("Program id is required");
      if (!programiIds.includes(exercise.programId))
        programiIds.push(exercise.programId);
    });

    const _exercises = await this.db
      .insert(ExerciseModel)
      .values(data)
      .returning();

    if (_exercises.length === 0)
      throw new ServerError("Failed to create exercise");

    const exerciseIds: number[] = _exercises.map((e) => e.id);

    const exercises = await this.select(inArray(ExerciseModel.id, exerciseIds));
    console.log(exercises);
    return exercises;
  }

  async update(data: InsertExercise): Promise<ExerciseExtended> {
    if (!data.id) throw new BadRequestError("Exercise id is required");

    const updateExercise = await this.db
      .update(ExerciseModel)
      .set(data)
      .where(eq(ExerciseModel.id, data.id))
      .returning();

    if (updateExercise.length === 0)
      throw new ServerError("Failed to update exercise");

    const exercises = await this.select(eq(ExerciseModel.id, data.id));

    return exercises[0];
  }

  async updateBulk(data: InsertExercise[]): Promise<ExerciseExtended[]> {
    let exerciseIds: number[] = [];

    data.forEach((exercise) => {
      if (!exercise.id) throw new BadRequestError("Exercise id is required");
      if (!exerciseIds.includes(exercise.id)) exerciseIds.push(exercise.id);
    });

    const finds = await this.db
      .select({ id: ExerciseModel.id })
      .from(ExerciseModel)
      .where(inArray(ExerciseModel.id, exerciseIds));

    exerciseIds.forEach((id) => {
      const find = finds.find((f) => f.id === id);
      if (!find) throw new BadRequestError(`Exercise with id ${id} not found`);
    });

    let updatePromises: Promise<any>[] = [];
    data.forEach((exercise) => {
      const result = this.db
        .update(ExerciseModel)
        .set({ ...exercise, updatedAt: new Date() })
        .where(eq(ExerciseModel.id, exercise.id ?? 0))
        .returning()
        .then((rows) => this.select(eq(ExerciseModel.id, rows[0].id)));
      updatePromises.push(result);
    });

    const exercises = await Promise.all(updatePromises);

    if (exercises.length === 0)
      throw new ServerError("Failed to update exercise");

    return exercises.map((e) => e[0]);
  }

  async delete(id: number): Promise<ExerciseExtended> {
    const exercises = await this.db
      .delete(ExerciseModel)
      .where(eq(ExerciseModel.id, id))
      .returning();

    if (exercises.length === 0)
      throw new ServerError("Failed to delete exercise");

    return exercises[0];
  }

  async find(id: number): Promise<ExerciseExtended> {
    const exercises = await this.select(eq(ExerciseModel.id, id));

    return exercises[0];
  }

  async list({
    programId,
  }: {
    programId: number;
  }): Promise<ExerciseExtended[]> {
    const exercises = await this.select(eq(ExerciseModel.programId, programId));

    return exercises;
  }
}
