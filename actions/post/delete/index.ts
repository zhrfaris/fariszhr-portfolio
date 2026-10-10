"use server";

import { db } from "@/lib/db";
import { DeletePost } from "./schema";
import { revalidatePath } from "next/cache";
import { ReturnType, InputType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { auth } from "@/auth";
import {
  destroyCloudinaryImage,
  initializeCloudinary,
} from "@/lib/cloudinary-lib";
import {
  partitionUnusedPublicIds,
  postImagePublicIds,
} from "@/lib/post-image-cleanup";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return {
      error: "Unauthorized",
    };
  }

  const { id } = data;

  const existPost = await db.post.findUnique({
    where: { id },
  });

  if (!existPost) {
    return {
      error: `post doesn't exist`,
    };
  }

  // Delete the post's Cloudinary images (cover, thumbnail, GIF, legacy
  // content images and inline block-editor images), skipping any public_id
  // still used by another post, a workplace or a user photo.
  try {
    const { toDelete, inUse } = await partitionUnusedPublicIds(
      postImagePublicIds(existPost),
      [id]
    );
    if (inUse.length > 0) {
      console.log(`Keeping ${inUse.length} image(s) still in use`, inUse);
    }
    if (toDelete.length > 0) {
      // Call Cloudinary directly: a server-side fetch to /api/image/delete
      // carries no session cookie and would be rejected with 401.
      initializeCloudinary();
      await destroyCloudinaryImage(toDelete);
    }
  } catch (error) {
    console.log(error);
    return {
      error: "Error while deleting posts images",
    };
  }

  // remove all connections
  try {
    await db.post.update({
      where: {
        id,
      },
      data: {
        categories: { set: [] },
      },
    });
  } catch (error) {
    console.log(error);
    return {
      error: "Failed to unassign all post relations",
    };
  }

  let post;

  try {
    post = await db.post.delete({
      where: {
        id,
      },
    });
  } catch (error) {
    console.log(error);
    return {
      error: "Failed to delete role",
    };
  }

  revalidatePath("/dashboard/posts");
  return { data: post };
};

export const deletePost = createSafeAction(DeletePost, handler);
