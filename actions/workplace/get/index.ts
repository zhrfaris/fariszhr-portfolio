"use server";

import { db } from "@/lib/db";

export const getWorkplaces = async (userId: string) => {
  return await db.workplace.findMany({ where: { user: { id: userId } } });
};

export const getWorkplacesBySlug = async (username: string) => {
  return await db.workplace.findMany({
    where: { user: { username } },
  });
};

export const getWorkplaceById = async (id: string) => {
  return await db.workplace.findUnique({ where: { id } });
};

export const getWorkplaceBySlug = async (slug: string) => {
  return await db.workplace.findUnique({ where: { slug } });
};

export const getWorkplacesCombobox = async () => {
  return await db.workplace.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
    },
  });
};
