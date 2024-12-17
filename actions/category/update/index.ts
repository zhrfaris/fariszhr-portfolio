"use server";

import { db } from "@/lib/db";
import { UpdateCategory } from "./schema";
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

  const { id, name, post_ids } = data;

  let category;

  try {
    category = await db.category.update({
      where: {
        id,
      },
      data: {
        name,
        posts: {
          connect: post_ids ? post_ids.map((id) => ({ id })) : [],
        },
      },
    });
  } catch (error) {
    console.log(error);
    return {
      error: "Failed to update category",
    };
  }

  revalidatePath("/dashboard/categories");
  return { data: category };
};

export const updateCategory = createSafeAction(UpdateCategory, handler);
