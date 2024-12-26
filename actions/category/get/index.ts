"use server";

import { db } from "@/lib/db";

export const getCategories = async (userId: string) => {
  return await db.category.findMany({ where: { user: { id: userId } } });
};

export const getCategoryById = async (id: string) => {
  return await db.category.findUnique({ where: { id } });
};

export const getCategoryBySlug = async (slug: string) => {
  return await db.category.findUnique({ where: { slug } });
};

export const getCategoriesCombobox = async () => {
  return await db.category.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
    },
  });
};
