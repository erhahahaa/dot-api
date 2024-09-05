import { SQL, and, eq } from "drizzle-orm";
import { BadRequestError, ServerError } from "../../core/errors";
import { BaseRepo } from "../../core/repo";
import { DrizzlePostgres } from "../../core/services/db";
import { MediaModel } from "../media/media.model";
import { UserToClubModel } from "../user/user.model";
import { TacticalModel } from "./tactical.model";
import { InsertTactical, Tactical, TacticalExtended } from "./tactical.schema";

abstract class TacticalRepo extends BaseRepo<Tactical> {}

export class TacticalRepoImpl extends TacticalRepo {
  private db: DrizzlePostgres;

  constructor(db: DrizzlePostgres) {
    super();
    this.db = db;
  }

  private select(where: SQL<unknown> | undefined): Promise<TacticalExtended[]> {
    return this.db.query.TacticalModel.findMany({
      with: {
        media: true,
      },
      where,
    });
    return this.db
      .select({
        id: TacticalModel.id,
        clubId: TacticalModel.clubId,
        mediaId: TacticalModel.mediaId,
        name: TacticalModel.name,
        description: TacticalModel.description,
        board: TacticalModel.board,
        strategic: TacticalModel.strategic,
        isLive: TacticalModel.isLive,
        host: TacticalModel.host,
        createdAt: TacticalModel.createdAt,
        updatedAt: TacticalModel.updatedAt,
        media: {
          ...MediaModel,
        },
      })
      .from(TacticalModel)
      .leftJoin(
        UserToClubModel,
        eq(UserToClubModel.clubId, TacticalModel.clubId),
      )
      .leftJoin(MediaModel, eq(TacticalModel.mediaId, MediaModel.id))
      .where(where);
  }

  async create(data: InsertTactical): Promise<TacticalExtended> {
    const tacticals = await this.db
      .insert(TacticalModel)
      .values(data)
      .returning()
      .then((rows) => this.select(eq(TacticalModel.id, rows[0].id)));

    if (tacticals.length === 0)
      throw new ServerError("Failed to create tactical");

    return tacticals[0];
  }

  async update(data: InsertTactical): Promise<TacticalExtended> {
    if (!data.id) throw new BadRequestError("Tactical id is required");

    const updateTactical = await this.db
      .update(TacticalModel)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(TacticalModel.id, data.id))
      .returning();

    if (updateTactical.length === 0)
      throw new ServerError("Failed to update tactical");

    const tacticals = await this.select(eq(TacticalModel.id, data.id));

    return tacticals[0];
  }

  async delete(id: number): Promise<TacticalExtended> {
    const tacticals = await this.db
      .delete(TacticalModel)
      .where(eq(TacticalModel.id, id))
      .returning();

    if (tacticals.length === 0)
      throw new ServerError("Failed to delete tactical");

    return tacticals[0];
  }

  async find(id: number): Promise<TacticalExtended> {
    const tacticals = await this.select(eq(TacticalModel.id, id));

    return tacticals[0];
  }

  async list({
    clubId,
    userId,
  }: {
    clubId?: number | null;
    userId?: number | null;
  }): Promise<Tactical[]> {
    let tacticals: TacticalExtended[] = [];
    if (!clubId && userId) {
      tacticals = await this.select(eq(UserToClubModel.userId, userId));
    } else if (clubId && !userId) {
      tacticals = await this.select(eq(TacticalModel.clubId, clubId));
    } else if (clubId && userId) {
      tacticals = await this.select(
        and(
          eq(UserToClubModel.userId, userId),
          eq(TacticalModel.clubId, clubId),
        ),
      );
    } else {
      throw new BadRequestError("Club id or user id is required");
    }

    return tacticals;
  }
}
