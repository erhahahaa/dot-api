import { compare, hash } from "bcrypt-ts";

export async function encryptPassword(password: string): Promise<string> {
  const salt = parseInt(process.env.SALT_ROUND ?? "10");
  return await hash(password, salt);
}

export async function verifyPassword(
  plain: string,
  encrypted: string
): Promise<boolean> {
  return await compare(plain, encrypted);
}

export function sanitize(obj: any, exceptsNotation: string[]) {
  const result: any = {};
  Object.keys(obj).forEach((key) => {
    if (!exceptsNotation.includes(key)) {
      result[key] = obj[key];
    }
  });
  return result;
}
