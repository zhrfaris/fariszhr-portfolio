"use server";

import { db } from "@/lib/db";

export const getPosts = async (userId: string) => {
  return await db.post.findMany({ where: { author: { id: userId } } });
};

export const getPostById = async (id: string) => {
  return await db.post.findUnique({ where: { id } });
};

export const getPostBySlug = async (slug: string) => {
  return await db.post.findUnique({ where: { slug } });
};
