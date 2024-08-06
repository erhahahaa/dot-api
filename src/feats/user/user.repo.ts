import { eq, ilike, inArray, or } from "drizzle-orm";
import {
  BadRequestError,
  NoContentError,
  ServerError,
} from "../../core/errors";
import { BaseRepo } from "../../core/repo";
import { DrizzlePostgres } from "../../core/services/db";
import { sanitize } from "../../utils";
import { UserModel } from "./user.model";
import { InsertUser, UpdateUser, User } from "./user.schema";

abstract class UserRepo extends BaseRepo<User> {
  abstract search(query: string): Promise<User[]>;
  abstract findByUsername(username: string): Promise<User[]>;
  abstract findByManyUsername(username: string[]): Promise<User[]>;
}

export class UserRepoImpl extends UserRepo {
  private db: DrizzlePostgres;

  constructor(db: DrizzlePostgres) {
    super();
    this.db = db;
  }

  async create(data: InsertUser): Promise<User> {
    const { password, ...rest } = data;
    if (!password) throw new ServerError("Password is required");

    const hash = await Bun.password.hash(password, "bcrypt");

    const users = await this.db
      .insert(UserModel)
      .values({
        ...rest,
        bornDate: new Date(data.bornDate ?? new Date()),
        password: hash,
      })
      .returning();

    if (users.length === 0) {
      throw new ServerError("Failed to create user");
    }

    return sanitize(users[0], ["password"]);
  }

  async update(data: UpdateUser): Promise<User> {
    const { password, email, username, ...rest } = data;
    if (!email || !username) {
      throw new BadRequestError("Email or username is required");
    }
    const find = await this.db
      .select()
      .from(UserModel)
      .where(or(eq(UserModel.email, email), eq(UserModel.username, username)));

    if (find.length === 0) throw new ServerError("User not found");

    let hash = undefined;
    if (password) {
      if (password?.length > 0) {
        hash = await Bun.password.hash(password, "bcrypt");
      } else {
        hash = find[0].password;
      }
    } else {
      hash = find[0].password;
    }

    const users = await this.db
      .update(UserModel)
      .set({
        ...rest,
        password: hash,
        bornDate: new Date(data.bornDate ?? new Date()),
        updatedAt: new Date(),
      })
      .where(eq(UserModel.email, email))
      .returning();

    if (users.length === 0) {
      throw new ServerError("Failed to update user");
    }

    return sanitize(users[0], ["password"]);
  }

  async delete(id: number): Promise<User> {
    const users = await this.db
      .delete(UserModel)
      .where(eq(UserModel.id, id))
      .returning();

    if (users.length === 0) {
      throw new ServerError("Failed to delete user");
    }

    return sanitize(users[0], ["password"]);
  }

  async find(id: number): Promise<User> {
    const users = await this.db
      .select()
      .from(UserModel)
      .where(eq(UserModel.id, id));

    if (users.length === 0) {
      throw new NoContentError("User not found");
    }

    return sanitize(users[0], ["password"]);
  }

  async list(): Promise<User[]> {
    const users = await this.db.select().from(UserModel);

    if (users.length === 0) {
      throw new NoContentError("No user found");
    }

    return users.map((user) => sanitize(user, ["password"]));
  }

  async search(query: string): Promise<User[]> {
    const users = await this.db
      .select()
      .from(UserModel)
      .where(
        or(
          ilike(UserModel.name, `%${query}%`),
          ilike(UserModel.username, `%${query}%`)
        )
      );

    if (users.length === 0) {
      throw new NoContentError("No user found");
    }

    return users.map((user) => sanitize(user, ["password"]));
  }
  async findByUsername(username: string): Promise<User[]> {
    const users = await this.db
      .select()
      .from(UserModel)
      .where(eq(UserModel.username, username));

    return users.map((user) => sanitize(user, ["password"]));
  }

  async findByManyUsername(username: string[]): Promise<User[]> {
    const users = await this.db
      .select()
      .from(UserModel)
      .where(inArray(UserModel.username, username));

    return users.map((user) => sanitize(user, ["password"]));
  }
}
