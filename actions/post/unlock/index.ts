"use server";

import { cookies } from "next/headers";
import { decrypt } from "@/app/(private)/api/utils";
import { db } from "@/lib/db";
import {
  UNLOCK_MAX_AGE_SECONDS,
  createUnlockToken,
  passwordMatches,
  unlockCookieName,
} from "@/lib/post-lock";

export type UnlockResult = { success: true } | { success: false; error: string };

/**
 * Checks a visitor's password for a restricted post. The comparison happens
 * here on the server; the real password never reaches the browser. On success
 * a signed, httpOnly unlock cookie is set and the page re-renders with Content.
 */
export async function unlockPost(
  slug: string,
  formData: FormData,
): Promise<UnlockResult> {
  const input = String(formData.get("passcode") ?? "").trim();
  if (!input) return { success: false, error: "Enter the password." };

  const post = await db.post.findUnique({
    where: { slug },
    select: { id: true, status: true, isRestricted: true, passwordHashed: true },
  });

  if (!post || post.status === "INACTIVE" || !post.isRestricted || !post.passwordHashed) {
    return { success: false, error: "This case study can't be unlocked." };
  }

  let stored: string;
  try {
    stored = decrypt(post.passwordHashed);
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }

  if (!passwordMatches(input, stored)) {
    // Small delay to slow down guessing.
    await new Promise((r) => setTimeout(r, 400));
    return { success: false, error: "That password isn't right. Try again." };
  }

  const cookieStore = await cookies();
  cookieStore.set(unlockCookieName(slug), createUnlockToken(post), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: UNLOCK_MAX_AGE_SECONDS,
    path: "/",
  });

  return { success: true };
}
