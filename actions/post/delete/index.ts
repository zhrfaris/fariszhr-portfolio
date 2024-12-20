"use server";

import { db } from "@/lib/db";
import { DeletePost } from "./schema";
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

  const { id } = data;

  const existPost = await db.post.findUnique({
    where: { id },
  });

  if (!existPost) {
    return {
      error: `post doesn't exist`,
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
        authorId: { set: undefined },
        workplaceId: { set: undefined },
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
