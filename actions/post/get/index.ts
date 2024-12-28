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
