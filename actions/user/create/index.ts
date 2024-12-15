"use server";

import { db } from "@/lib/db";
import { CreateUser } from "./schema";
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

  const {
    name,
    email,
    password,
    username,
    category_ids,
    cv_url,
    deck_intro_url,
    linkedin_url,
    occupation,
    photo,
    post_ids,
    tagline,
    workplace_ids,
  } = data;

  let slug = slugify(name);

  const userExist = await db.user.findUnique({
    where: {
      username,
    },
  });

  if (userExist) {
    let count = 1;
    let newSlug;
    do {
      newSlug = `${slug}-${count}`;
      count++;
    } while (await db.user.findUnique({ where: { username: newSlug } }));
    slug = newSlug;
  }

  let user;

  try {
    user = await db.user.create({
      data: {
        name,
        username,
        email,
        password,
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
  } catch (err) {
    console.log(err);
    return {
      error: "Failed to create user",
    };
  }

  revalidatePath("/dashboard/profile");
  return { data: user };
};

export const createUser = createSafeAction(CreateUser, handler);
