"use server";

import { db } from "@/lib/db";
import { DeleteWorkplace } from "./schema";
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

  const existWorkplace = await db.workplace.findUnique({
    where: { id },
  });

  if (!existWorkplace) {
    return {
      error: `Workplace doesn't exist`,
    };
  }

  // remove all connections
  try {
    await db.workplace.update({
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
      error: "Failed to unassign all Workplace relations",
    };
  }

  let workplace;

  try {
    workplace = await db.workplace.delete({
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

  revalidatePath("/dashboard/workplaces");
  return { data: workplace };
};

export const deleteWorkplace = createSafeAction(DeleteWorkplace, handler);
