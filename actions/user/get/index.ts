"use server";

import { countRequestDuration } from "@/actions/utils";
import { db, MAIN_USERNAME } from "@/lib/db";
import { unstable_cache } from "next/cache";

export const getUserById = async (id: string) => {
  return await db.user.findUnique({ where: { id } });
};

export const getUserByUsername = async (username: string) => {
  return await db.user.findUnique({ where: { username } });
};

export const getUser = unstable_cache(
  async () => {
    return await countRequestDuration(getUserByUsername, MAIN_USERNAME);
  },
  ["user"],
  { revalidate: 60 * 10, tags: ["user"] },
);
