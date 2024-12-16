"use server";

import { db } from "@/lib/db";
import { CreateWorkplace } from "./schema";
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

  const { image, name, post_ids, url } = data;

  const slug = slugify(name);

  const workplaceExist = await db.workplace.findUnique({
    where: {
      slug,
    },
  });

  if (workplaceExist) {
    return {
      error: `Workplace ${name} already exist`,
    };
  }

  let workplace;

  try {
    workplace = await db.workplace.create({
      data: {
        name,
        slug,
        image,
        url,
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
      error: "Failed to create workplace",
    };
  }

  revalidatePath("/dashboard/workplaces");
  return { data: workplace };
};

export const createWorkplace = createSafeAction(CreateWorkplace, handler);
