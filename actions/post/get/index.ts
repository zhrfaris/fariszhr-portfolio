"use server";

import { db } from "@/lib/db";

export const getPosts = async (
  userId: string,
  options?: { selectAllRelations?: boolean }
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
