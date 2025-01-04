"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ReturnType, InputType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { auth } from "@/auth";
import { ReorderPost } from "./schema";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return {
      error: "Unauthorized",
    };
  }

  const postToEdit = data;

  let posts;

  try {
    const transactions = postToEdit.map((post) =>
      db.post.update({
        where: {
          id: post.id,
        },
        data: {
          order: post.order,
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

export const reorderPost = createSafeAction(ReorderPost, handler);
