import crypto from "crypto";
import { cookies } from "next/headers";

/*
 * Password lock for restricted case studies (server only).
 *
 * After a correct password the visitor gets an httpOnly cookie holding a
 * token signed with AUTH_SECRET. The token is bound to the post id, an expiry
 * time, and a fingerprint of the stored (encrypted) password, so:
 *   - it can't be forged or copied to another post,
 *   - it stops working once it expires,
 *   - changing the post's password locks everyone out again.
 */

export const UNLOCK_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

const SECRET = process.env.AUTH_SECRET;

export const unlockCookieName = (slug: string) => `post_unlock_${slug}`;

type LockablePost = { id: string; passwordHashed: string | null };

const sign = (value: string) => {
  if (!SECRET) throw new Error("AUTH_SECRET is missing");
  return crypto.createHmac("sha256", SECRET).update(value).digest("base64url");
};

const fingerprint = (passwordHashed: string) =>
  crypto.createHash("sha256").update(passwordHashed).digest("base64url").slice(0, 16);

const safeEqual = (a: string, b: string) => {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
};

export function createUnlockToken(post: LockablePost): string {
  const expires = Math.floor(Date.now() / 1000) + UNLOCK_MAX_AGE_SECONDS;
  const payload = `${post.id}.${expires}.${fingerprint(post.passwordHashed ?? "")}`;
  return `${payload}.${sign(payload)}`;
}

function isValidUnlockToken(token: string | undefined, post: LockablePost) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 4) return false;
  const [id, expires, fp, signature] = parts;
  const payload = `${id}.${expires}.${fp}`;

  try {
    if (!safeEqual(signature, sign(payload))) return false;
  } catch {
    return false;
  }
  if (id !== post.id) return false;
  if (Number(expires) < Math.floor(Date.now() / 1000)) return false;
  return fp === fingerprint(post.passwordHashed ?? "");
}

/** True when the current request holds a valid unlock for this post. */
export async function hasUnlockedPost(slug: string, post: LockablePost) {
  const cookieStore = await cookies();
  return isValidUnlockToken(cookieStore.get(unlockCookieName(slug))?.value, post);
}

/** Constant-time comparison of a typed password against the stored one. */
export function passwordMatches(input: string, stored: string) {
  const a = crypto.createHash("sha256").update(input).digest();
  const b = crypto.createHash("sha256").update(stored).digest();
  return crypto.timingSafeEqual(a, b);
}
