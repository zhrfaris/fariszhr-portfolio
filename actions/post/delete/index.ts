"use server";

import { db } from "@/lib/db";
import { DeleteCategory } from "./schema";
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

  const existCategory = await db.category.findUnique({
    where: { id },
  });

  if (!existCategory) {
    return {
      error: `category doesn't exist`,
    };
  }

  // remove all connections
  try {
    await db.category.update({
      where: {
        id,
      },
      data: {
        posts: { set: [] },
        user: {
          disconnect: true,
        },
      },
    });
  } catch (error) {
    console.log(error);
    return {
      error: "Failed to unassign all category relations",
    };
  }

  let category;

  try {
    category = await db.category.delete({
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

  revalidatePath("/dashboard/categories");
  return { data: category };
};

export const deleteCategory = createSafeAction(DeleteCategory, handler);
