"use server";

import { decrypt } from "@/app/(private)/api/utils";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export const getPosts = async (
  userId: string,
  options?: { selectAllRelations?: boolean },
) => {
  return await db.post.findMany({
    where: { author: { id: userId } },
    include: {
      categories: options?.selectAllRelations,
      author: options?.selectAllRelations,
      workplace: options?.selectAllRelations,
    },
    orderBy: [{ order: "asc" }, { title: "asc" }],
  });
};

export const getPostCount = async () => {
  return await db.post.count();
};

export const getPostsForSitemap = async (username: string, skip?: number) => {
  return await db.post.findMany({
    where: { author: { username }, status: "ACTIVE" },
    select: { slug: true, thumbnail_image: true },
    skip,
    take: 50_000,
  });
};

export const getPostsShowCase = async (username: string) => {
  return await db.post.findMany({
    where: { author: { username }, status: "ACTIVE" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      thumbnail_image: true,
      thumbnail_gif: true,
      order: true,
      post_sections: { select: { id: true } },
      categories: true,
    },
    take: 4,
    orderBy: [{ order: "asc" }, { title: "asc" }],
  });
};

export const getPostById = async (id: string) => {
  return await db.post.findUnique({
    where: { id },
    include: { categories: true, workplace: true },
  });
};

export const getPostBySlug = async (slug: string) => {
  return await db.post.findUnique({
    where: { slug },
    include: { categories: true, workplace: true },
  });
};

export const getPortfolioBySlug = async (slug: string) => {
  return await db.post.findUnique({
    where: { slug },
    // select: {
    //   id: true,
    //   categories: true,
    //   workplace: true,
    //   header_image: true,
    //   title: true,
    //   status: true,
    //   slug: true,
    //   post_sections: {
    //     select: {
    //       id: true,
    //     },
    //   },
    // },
    include: {
      workplace: true,
      categories: true,
    },
  });
};

export const getPostSectionsBySlug = async (slug: string) => {
  const post = await db.post.findUnique({
    where: { slug },
    select: {
      post_sections: true,
    },
  });

  return post?.post_sections ?? [];
};

export const getPostForMetadata = async (slug: string) => {
  return await db.post.findUnique({
    where: { slug },
    select: { title: true, excerpt: true },
  });
};

export const getPostSlugsShowCase = async (username: string) => {
  return await db.post.findMany({
    where: { author: { username }, status: "ACTIVE" },
    select: { slug: true },
    take: 4,
  });
};

export async function verifyPostPasscode(slug: string, formData: FormData) {
  const passcode = formData.get("passcode") as string;

  const post = await getPostBySlug(slug);

  if (!post) {
    return { success: false, error: "Post not found." };
  }

  // 1. Fetch the hashed passcode for this specific slug from DB
  const passcodeHash = post.passwordHashed;

  if (!passcodeHash) {
    return { success: false, error: "This post is not restricted." };
  }

  // 2. Verify the passcode
  const isValid = passcode === decrypt(passcodeHash);

  if (!isValid) {
    return { success: false, error: "Incorrect passcode. Please try again." };
  }

  // 3. Set a secure cookie valid for this specific post
  // In production, consider encrypting this token, but a signed/standard cookie works for basic gating
  const cookieStore = await cookies();
  cookieStore.set(`unlocked_${slug}`, "true", {
    httpOnly: true, // Prevents client-side JS from reading it
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 24 hours persistence
    path: "/",
  });

  return { success: true };
}
