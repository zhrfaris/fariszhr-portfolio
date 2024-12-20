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

  // remove all connections
  try {
    const unassignTransactions = ids.map((id) =>
      db.post.update({
        where: {
          id,
        },
        data: {
          categories: { set: [] },
          authorId: { set: undefined },
          workplaceId: { set: undefined },
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
