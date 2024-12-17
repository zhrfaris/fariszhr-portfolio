"use server";

import { db } from "@/lib/db";
import { CreateCategory } from "./schema";
import { revalidatePath } from "next/cache";
import { ReturnType, InputType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import slugify from "react-slugify";
import { auth } from "@/auth";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return {
      error: "Unauthorized",
    };
  }

  const { name, post_ids } = data;

  const slug = slugify(name);

  const categoryExist = await db.category.findUnique({
    where: {
      slug,
    },
  });

  if (categoryExist) {
    return {
      error: `Category ${name} already exist`,
    };
  }

  let category;

  try {
    category = await db.category.create({
      data: {
        name,
        slug,
        posts: {
          connect: post_ids?.map((id) => ({ id })),
        },
        user: {
          connect: {
            id: session.user.id,
          },
        },
      },
    });
  } catch (error) {
    console.log(error);
    return {
      error: "Failed to create category",
    };
  }

  revalidatePath("/dashboard/categories");
  return { data: category };
};

export const createCateCreateCategory = createSafeAction(
  CreateCategory,
  handler
);
