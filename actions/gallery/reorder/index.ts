"use server";

import { db } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { ReturnType, InputType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { auth } from "@/auth";
import { ReorderGalleryPhotos } from "./schema";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return {
      error: "Unauthorized",
    };
  }

  const userId = session.user.id;
  let results;

  try {
    // updateMany (not update) so the userId filter scopes every write to the
    // signed-in user's own photos.
    results = await db.$transaction(
      data.map((photo) =>
        db.galleryPhoto.updateMany({
          where: { id: photo.id, userId },
          data: { order: photo.order },
        })
      )
    );
  } catch (error) {
    console.log(error);
    return {
      error: "Failed to save the photo order",
    };
  }

  revalidateTag("gallery");
  revalidatePath("/dashboard/gallery");
  revalidatePath("/photography");
  return { data: { count: results.reduce((n, r) => n + r.count, 0) } };
};

export const reorderGalleryPhotos = createSafeAction(
  ReorderGalleryPhotos,
  handler
);
