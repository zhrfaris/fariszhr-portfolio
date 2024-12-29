"use server";

import { db } from "@/lib/db";

export const getUserById = async (id: string) => {
  return await db.user.findUnique({ where: { id } });
};

export const getUserByUsername = async (username: string) => {
  return await db.user.findUnique({ where: { username } });
};
