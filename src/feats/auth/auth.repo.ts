import { eq, or } from "drizzle-orm";
import {
  AuthenticationError,
  BadRequestError,
  ServerError,
} from "../../core/errors";
import { DrizzlePostgres } from "../../core/services/db";
import { sanitize } from "../../utils";
import { UserModel } from "../user/user.model";
import { User } from "../user/user.schema";
import { AuthSignIn, AuthSignUp } from "./auth.schema";

abstract class AuthRepo {
  abstract signIn(data: AuthSignIn): Promise<User>;
  abstract signUp(data: AuthSignUp): Promise<User>;
}

export class AuthRepoImpl extends AuthRepo {
  private db: DrizzlePostgres;

  constructor(db: DrizzlePostgres) {
    super();
    this.db = db;
  }

  async signIn(data: AuthSignIn): Promise<User> {
    const isPhone = /^\d+$/.test(data.identifier);

    const user = await this.db
      .select()
      .from(UserModel)
      .where(
        or(
          eq(UserModel.email, data.identifier),
          eq(UserModel.username, data.identifier),
          isPhone ? eq(UserModel.phone, parseInt(data.identifier)) : undefined
        )
      );

    if (user.length === 0) {
      throw new AuthenticationError("User not found");
    }

    const isValid = await Bun.password.verify(
      data.password,
      user[0].password,
      "bcrypt"
    );

    if (!isValid) {
      throw new AuthenticationError("Invalid credentials");
    }

    return sanitize(user[0], ["password"]);
  }

  async signUp(data: AuthSignUp): Promise<User> {
    if (!data.password) throw new BadRequestError("Password is required");
    const find = await this.db
      .select()
      .from(UserModel)
      .where(
        or(
          eq(UserModel.email, data.email),
          eq(UserModel.username, data.username),
          eq(UserModel.phone, data.phone)
        )
      );

    if (find.length > 0) {
      throw new Error("User already exists");
    }

    const hash = await Bun.password.hash(data.password, "bcrypt");

    const result = await this.db
      .insert(UserModel)
      .values({
        ...data,
        bornDate: new Date(data.bornDate ?? new Date()),
        password: hash,
      })
      .returning();

    if (result.length === 0) {
      throw new ServerError("Failed to sign up");
    }

    return sanitize(result[0], ["password"]);
  }
}
