"use server";

import { db } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { ReturnType, InputType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { auth } from "@/auth";
import { CreateGalleryPhotos } from "./schema";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return {
      error: "Unauthorized",
    };
  }

  const userId = session.user.id;
  let photos;

  try {
    // New uploads go to the end of the grid, in the order they finished.
    const last = await db.galleryPhoto.findFirst({
      where: { userId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const start = (last?.order ?? -1) + 1;

    photos = await db.$transaction(
      data.images.map((image, index) =>
        db.galleryPhoto.create({
          data: { image, order: start + index, userId },
        })
      )
    );
  } catch (error) {
    console.log(error);
    return {
      error: "Failed to save uploaded photos",
    };
  }

  revalidateTag("gallery");
  revalidatePath("/dashboard/gallery");
  revalidatePath("/photography");
  return { data: photos };
};

export const createGalleryPhotos = createSafeAction(
  CreateGalleryPhotos,
  handler
);
