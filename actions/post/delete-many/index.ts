"use server";

import { db } from "@/lib/db";
import { DeleteManyPosts } from "./schema";
import { revalidatePath } from "next/cache";
import { ReturnType, InputType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { auth } from "@/auth";

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

  const allCoverPublicIds: string[] = [];

  const postsToDelete = await db.$transaction(allPostTransaction);

  for (const post of postsToDelete) {
    if (!!post?.header_image?.public_id) {
      allCoverPublicIds.push(post?.header_image?.public_id);
    }
    if (!!post?.thumbnail_image?.public_id) {
      allCoverPublicIds.push(post?.thumbnail_image?.public_id);
    }
    if (!!post?.thumbnail_gif?.public_id) {
      allCoverPublicIds.push(post?.thumbnail_gif?.public_id);
    }

    if (!!post?.post_sections && post?.post_sections.length > 0) {
      const sectionsWithContents = post.post_sections.filter(
        (section) => section.contents.length > 0
      );
      const contentsWithImages = sectionsWithContents.flatMap((section) =>
        section.contents.filter((content) => content.image?.public_id)
      );
      const ids: string[] = contentsWithImages
        .map((content) => content.image?.public_id)
        .filter((t) => typeof t === "string");
      allCoverPublicIds.concat(ids);
    }
  }

  if (allCoverPublicIds.length > 0) {
    try {
      const deleteGalleriesTransaction = allCoverPublicIds.map((id) =>
        fetch(`${process.env.API_BASE_URL}/api/image/delete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ public_id: id }),
        })
      );

      await Promise.all(deleteGalleriesTransaction);
    } catch (error) {
      console.log(error);
      return {
        error: "Error while deleting posts images",
      };
    }
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
