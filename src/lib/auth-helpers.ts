import { compare, hash } from "bcryptjs";
import crypto from "node:crypto";

export async function hashPassword(password: string) {
  return hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash);
}

export function generateApiKey() {
  const token = crypto.randomBytes(16).toString("hex");
  return {
    plainText: `musi_live_${token}`,
    prefix: token.slice(0, 8),
  };
}
