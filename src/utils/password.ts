import { compare, hash } from "bcrypt";

export async function encryptPassword(password: string) {
  const salt = parseInt(process.env.SALT_ROUND ?? "10");
  return await hash(password, salt);
}

export function verifyPassword(plain: string, encrypted: string): boolean {
  let valid: boolean = false;
  compare(plain, encrypted, function (err, res) {
    if (err) valid = false;
    valid = res;
  });
  return valid;
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
