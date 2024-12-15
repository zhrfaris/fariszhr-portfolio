"use server";

import { db } from "@/lib/db";
import { UpdateUser } from "./schema";
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

  const {
    id,
    name,
    email,
    occupation,
    tagline,
    category_ids,
    cv_url,
    deck_intro_url,
    linkedin_url,
    photo,
    post_ids,
    workplace_ids,
  } = data;

  let user;

  try {
    user = await db.user.update({
      where: {
        id,
      },
      data: {
        name,
        email,
        cv_url,
        deck_intro_url,
        linkedin_url,
        occupation,
        photo,
        tagline,
        posts: {
          connect: post_ids ? post_ids.map((id) => ({ id })) : [],
        },
        workplaces: {
          connect: workplace_ids ? workplace_ids.map((id) => ({ id })) : [],
        },
        categories: {
          connect: category_ids ? category_ids.map((id) => ({ id })) : [],
        },
      },
    });
  } catch (error) {
    console.log(error);
    return {
      error: "Failed to update user",
    };
  }

  revalidatePath("/dashboard/profile");
  return { data: user };
};

export const updateUser = createSafeAction(UpdateUser, handler);
