"use server";

import { db } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { ReturnType, InputType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { auth } from "@/auth";
import { DeleteGalleryPhotos } from "./schema";
import {
  destroyCloudinaryImage,
  initializeCloudinary,
} from "@/lib/cloudinary-lib";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return {
      error: "Unauthorized",
    };
  }

  const where = { id: { in: data.ids }, userId: session.user.id };
  const photos = await db.galleryPhoto.findMany({
    where,
    select: { image: true },
  });

  if (photos.length === 0) {
    return {
      error: "Photo doesn't exist",
    };
  }

  const publicIds = photos
    .map((p) => p.image.public_id)
    .filter((id): id is string => !!id);

  if (publicIds.length > 0) {
    try {
      // Call Cloudinary directly: a server-side fetch to /api/image/delete
      // carries no session cookie and would be rejected with 401.
      initializeCloudinary();
      await destroyCloudinaryImage(publicIds);
    } catch (error) {
      console.log(error);
      return {
        error: "Error while deleting photo images",
      };
    }
  }

  let result;

  try {
    result = await db.galleryPhoto.deleteMany({ where });
  } catch (error) {
    console.log(error);
    return {
      error: "Failed to delete photos",
    };
  }

  revalidateTag("gallery");
  revalidatePath("/dashboard/gallery");
  revalidatePath("/photography");
  return { data: { count: result.count } };
};

export const deleteGalleryPhotos = createSafeAction(
  DeleteGalleryPhotos,
  handler
);
