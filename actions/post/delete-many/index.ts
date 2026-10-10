"use server";

import { db } from "@/lib/db";
import { DeleteManyPosts } from "./schema";
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

  const { ids } = data;

  // delete image from cloudinary storage
  const allPostTransaction = ids.map((id) =>
    db.post.findUnique({
      where: {
        id,
      },
    })
  );

  const postsToDelete = await db.$transaction(allPostTransaction);

  // Delete the posts' Cloudinary images (cover, thumbnail, GIF, legacy
  // content images and inline block-editor images), skipping any public_id
  // still used by a post that is not being deleted, a workplace or a user.
  try {
    const candidateIds = postsToDelete.flatMap((post) =>
      post ? postImagePublicIds(post) : []
    );
    const { toDelete, inUse } = await partitionUnusedPublicIds(
      candidateIds,
      ids
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
    const unassignTransactions = ids.map((id) =>
      db.post.update({
        where: {
          id,
        },
        data: {
          categories: { set: [] },
        },
      })
    );

    await db.$transaction(unassignTransactions);
  } catch (error) {
    console.log(error);
    return {
      error: "Failed to unassign all relations",
    };
  }

  let posts;

  try {
    const transactions = ids.map((id) =>
      db.post.delete({
        where: {
          id: id,
        },
      })
    );

    posts = await db.$transaction(transactions);
  } catch (error) {
    console.log(error);
    return {
      error: "Failed to delete selected posts",
    };
  }

  revalidatePath("/dashboard/posts");
  return { data: posts };
};

export const deleteManyPosts = createSafeAction(DeleteManyPosts, handler);
