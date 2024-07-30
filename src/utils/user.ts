export function generateFromEmail(
  email: string,
  randomDigits?: number
): string {
  const [username] = email.split("@");
  const random = Math.random()
    .toString(36)
    .substring(2, randomDigits ? randomDigits + 2 : 6);
  return `${username}_${random}`;
}
