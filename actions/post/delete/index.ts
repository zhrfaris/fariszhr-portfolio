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

  // delete image from cloudinary storage
  const allCoverPublicIds: string[] = [];

  if (!!existPost?.header_image?.public_id) {
    allCoverPublicIds.push(existPost?.header_image?.public_id);
  }
  if (!!existPost?.thumbnail_image?.public_id) {
    allCoverPublicIds.push(existPost?.thumbnail_image?.public_id);
  }
  if (!!existPost?.thumbnail_gif?.public_id) {
    allCoverPublicIds.push(existPost?.thumbnail_gif?.public_id);
  }

  if (!!existPost?.post_sections && existPost?.post_sections.length > 0) {
    const sectionsWithContents = existPost.post_sections.filter(
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

  if (allCoverPublicIds.length > 0) {
    try {
      // Call Cloudinary directly: a server-side fetch to /api/image/delete
      // carries no session cookie and would be rejected with 401.
      initializeCloudinary();
      await destroyCloudinaryImage(allCoverPublicIds);
    } catch (error) {
      console.log(error);
      return {
        error: "Error while deleting posts images",
      };
    }
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
