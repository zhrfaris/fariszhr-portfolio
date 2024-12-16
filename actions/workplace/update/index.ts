"use server";

import { db } from "@/lib/db";
import { UpdateWorkplace } from "./schema";
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

  const { id, image, name, post_ids, url } = data;

  let workplace;

  try {
    workplace = await db.workplace.update({
      where: {
        id,
      },
      data: {
        image,
        name,
        url,
        posts: {
          connect: post_ids ? post_ids.map((id) => ({ id })) : [],
        },
      },
    });
  } catch (error) {
    console.log(error);
    return {
      error: "Failed to update workplace",
    };
  }

  revalidatePath("/dashboard/workplaces");
  return { data: workplace };
};

export const updateWorkplace = createSafeAction(UpdateWorkplace, handler);
