import { SHA256 as sha256 } from "crypto-js";

export const hashPassword = (str: string) => {
  return sha256(str).toString();
};

export function exclude<T extends Record<string, unknown>, K extends keyof T>(
  user: T,
  keys: K[]
) {
  for (const key of keys) {
    delete user[key];
  }
  return user;
}
