import { SQL, and, count, eq, sql } from "drizzle-orm";
import { BadRequestError, NoContentError } from "../../core/errors";
import { BaseRepo } from "../../core/repo";
import { DrizzlePostgres } from "../../core/services/db";
import { ExamModel } from "../exam";
import { MediaModel } from "../media/media.model";
import { ProgramModel } from "../program/program.model";
import { TacticalModel } from "../tactical/tactical.model";
import { UserModel, UserToClubModel } from "../user/user.model";
import { ClubModel } from "./club.model";
import { Club, ClubExtended, ClubMember, InsertClub } from "./club.schema";

abstract class ClubRepo extends BaseRepo<ClubExtended> {
  abstract getMembers(id: number): Promise<ClubMember[]>;
  abstract addMember(clubId: number, userId: number): Promise<ClubMember>;
  abstract kickMember(clubId: number, userId: number): Promise<ClubMember>;
  abstract leave(clubId: number, userId: number): Promise<ClubMember>;
}

export class ClubRepoImpl extends ClubRepo {
  private db: DrizzlePostgres;

  constructor(db: DrizzlePostgres) {
    super();
    this.db = db;
  }
  private select(where: SQL<unknown>): Promise<ClubExtended[]> {
    return this.db
      .select({
        id: ClubModel.id,
        creatorId: ClubModel.creatorId,
        mediaId: ClubModel.mediaId,
        name: ClubModel.name,
        description: ClubModel.description,
        type: ClubModel.type,
        createdAt: ClubModel.createdAt,
        updatedAt: ClubModel.updatedAt,
        media: MediaModel,
        memberCount: count(UserToClubModel.id),
        programCount: count(ProgramModel.id),
        examCount: count(ExamModel.id),
        tacticalCount: count(TacticalModel.id),
      })
      .from(UserToClubModel)
      .innerJoin(ClubModel, eq(UserToClubModel.clubId, ClubModel.id))
      .leftJoin(MediaModel, eq(ClubModel.mediaId, MediaModel.id))
      .leftJoin(ProgramModel, eq(UserToClubModel.clubId, ProgramModel.clubId))
      .leftJoin(ExamModel, eq(UserToClubModel.clubId, ExamModel.clubId))
      .leftJoin(TacticalModel, eq(UserToClubModel.clubId, TacticalModel.clubId))
      .where(where)
      .groupBy(ClubModel.id, MediaModel.id);
  }

  async create(data: InsertClub): Promise<Club> {
    const { creatorId, ...rest } = data;
    if (!creatorId) throw new BadRequestError("Creator id is required");
    const clubs = await this.db
      .insert(ClubModel)
      .values({
        ...rest,
        creatorId,
      })
      .returning()
      .then((clubs) =>
        this.db
          .insert(UserToClubModel)
          .values({
            userId: creatorId,
            clubId: clubs[0].id,
          })
          .returning()
      )
      .then((clubs) => this.select(eq(ClubModel.id, clubs[0].clubId)));

    console.log(clubs);

    if (clubs.length === 0) throw new NoContentError("Failed to create club");

    return clubs[0];
  }

  async update(data: InsertClub): Promise<ClubExtended> {
    if (!data.id) throw new BadRequestError("Club id is required");
    const clubs = await this.db
      .update(ClubModel)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(ClubModel.id, data.id))
      .returning();

    if (clubs.length === 0) throw new NoContentError("Failed to update club");

    return clubs[0];
  }

  async delete(id: number): Promise<Club> {
    const clubs = await this.db
      .delete(ClubModel)
      .where(eq(ClubModel.id, id))
      .returning();

    if (clubs.length === 0) throw new NoContentError("Failed to delete club");

    return clubs[0];
  }

  async find(id: number): Promise<ClubExtended> {
    const clubs = await this.select(eq(ClubModel.id, id));

    if (clubs.length === 0) throw new NoContentError("Club not found");

    return clubs[0];
  }

  async list({ userId }: { userId: number }): Promise<ClubExtended[]> {
    const clubs = await this.select(eq(UserToClubModel.userId, userId));

    if (clubs.length === 0) throw new NoContentError("No club found");

    return clubs as unknown as ClubExtended[];
  }

  private selectMember(where: SQL<unknown>) {
    return this.db
      .select({
        id: UserModel.id,
        name: UserModel.name,
        image: UserModel.image,
        role: UserToClubModel.role,
        age: sql`extract(year from age(${UserModel.bornDate}))::int`,
      })
      .from(UserToClubModel)
      .innerJoin(UserModel, eq(UserToClubModel.userId, UserModel.id))
      .where(where);
  }

  async getMembers(id: number): Promise<ClubMember[]> {
    const clubs = await this.selectMember(eq(UserToClubModel.clubId, id));

    if (clubs.length === 0) throw new NoContentError("Club not found");

    return clubs as ClubMember[];
  }

  async addMember(clubId: number, userId: number): Promise<ClubMember> {
    const clubs = await this.db
      .insert(UserToClubModel)
      .values({
        userId,
        clubId,
      })
      .returning()
      .then((rows) =>
        this.selectMember(eq(UserToClubModel.clubId, rows[0].clubId))
      );

    if (clubs.length === 0) throw new NoContentError("Failed to add member");

    return clubs[0] as ClubMember;
  }

  async kickMember(clubId: number, userId: number): Promise<ClubMember> {
    const clubs = await this.db
      .delete(UserToClubModel)
      .where(
        and(
          eq(UserToClubModel.clubId, clubId),
          eq(UserToClubModel.userId, userId)
        )
      )
      .returning()
      .then((rows) =>
        this.selectMember(eq(UserToClubModel.clubId, rows[0].clubId))
      );

    if (clubs.length === 0) throw new NoContentError("Failed to kick member");

    return clubs[0] as ClubMember;
  }

  async leave(clubId: number, userId: number): Promise<ClubMember> {
    const clubs = await this.db
      .delete(UserToClubModel)
      .where(
        and(
          eq(UserToClubModel.clubId, clubId),
          eq(UserToClubModel.userId, userId)
        )
      )
      .returning()
      .then((rows) =>
        this.selectMember(eq(UserToClubModel.clubId, rows[0].clubId))
      );

    if (clubs.length === 0) throw new NoContentError("Failed to leave club");

    return clubs[0] as ClubMember;
  }
}
