"use server";

import { ReturnType, InputType } from "./types";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { UnassignPostFromCategory } from "./schema";
import { auth } from "@/auth";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return {
      error: "Unauthorized",
    };
  }

  const { parentId: categoryId, id } = data;

  const categoryExist = await db.category.findUnique({
    where: {
      id,
    },
  });

  if (!categoryExist) {
    return {
      error: `Category doesn't exist`,
    };
  }

  try {
    await db.category.update({
      where: {
        id: id,
      },
      data: {
        posts: {
          disconnect: {
            id: categoryId,
          },
        },
      },
    });
  } catch (error) {
    console.log(error);
    return {
      error: "Failed to unassign post from category",
    };
  }

  return {
    data: {
      message: "post unassigned from category",
    },
  };
};

export const unassignPostFromCategory = createSafeAction(
  UnassignPostFromCategory,
  handler
);
