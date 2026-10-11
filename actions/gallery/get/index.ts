"use server";

import { countRequestDuration } from "@/actions/utils";
import { db, MAIN_USERNAME } from "@/lib/db";
import { unstable_cache } from "next/cache";

export const getGalleryPhotos = async (userId: string) => {
  return await db.galleryPhoto.findMany({
    where: { userId },
    orderBy: { order: "asc" },
  });
};

export const getGalleryPhotosByUsername = async (username: string) => {
  return await db.galleryPhoto.findMany({
    where: { user: { username } },
    orderBy: { order: "asc" },
    select: { id: true, image: true },
  });
};

export const getPublicGalleryPhotos = unstable_cache(
  async () => {
    return await countRequestDuration(getGalleryPhotosByUsername, MAIN_USERNAME);
  },
  ["gallery"],
  { revalidate: 60 * 10, tags: ["gallery"] },
);
