import { SHA256 as sha256 } from "crypto-js";
import crypto from "crypto";

export const hashPassword = (str: string) => {
  return sha256(str).toString();
};

export function exclude<T extends Record<string, unknown>, K extends keyof T>(
  user: T,
  keys: K[],
) {
  for (const key of keys) {
    delete user[key];
  }
  return user;
}

const ALGORITHM = "aes-256-gcm";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be 32 bytes/characters long
const IV_LENGTH = 12; // For AES-GCM

export function encrypt(text: string): string {
  if (!ENCRYPTION_KEY) throw new Error("ENCRYPTION_KEY is missing");

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY),
    iv,
  );

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  // Store the IV, the Auth Tag, and the Encrypted text together, separated by colons
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedData: string): string {
  if (!ENCRYPTION_KEY) throw new Error("ENCRYPTION_KEY is missing");

  const [ivHex, authTagHex, encryptedText] = encryptedData.split(":");

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY),
    iv,
  );

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
