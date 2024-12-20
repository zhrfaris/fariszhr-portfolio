"use server";

import { db } from "@/lib/db";
import { DeleteManyCategories } from "./schema";
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
      db.category.update({
        where: {
          id,
        },
        data: {
          posts: { set: [] },
          user: {
            disconnect: true,
          },
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

  let categories;

  try {
    const transactions = ids.map((id) =>
      db.category.delete({
        where: {
          id: id,
        },
      })
    );

    categories = await db.$transaction(transactions);
  } catch (error) {
    console.log(error);
    return {
      error: "Failed to delete selected categories",
    };
  }

  revalidatePath("/dashboard/categories");
  return { data: categories };
};

export const deleteManyCategories = createSafeAction(
  DeleteManyCategories,
  handler
);
