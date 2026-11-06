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
    const user = await countRequestDuration(getUserByUsername, MAIN_USERNAME);
    if (!user) return user;
    // Public pages pass this record to client components; the password hash
    // must never be serialized to the browser.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...publicUser } = user;
    return publicUser;
  },
  ["user-public"],
  { revalidate: 60 * 10, tags: ["user"] },
);
