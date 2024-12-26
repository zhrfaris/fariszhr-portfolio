"use server";

import { ReturnType, InputType } from "./types";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { UnassignPostFromWorkplace } from "./schema";
import { auth } from "@/auth";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return {
      error: "Unauthorized",
    };
  }

  const { parentId: workplaceId, id } = data;

  const workplaceExist = await db.workplace.findUnique({
    where: {
      id,
    },
  });

  if (!workplaceExist) {
    return {
      error: `Workplace doesn't exist`,
    };
  }

  try {
    await db.workplace.update({
      where: {
        id: id,
      },
      data: {
        posts: {
          disconnect: {
            id: workplaceId,
          },
        },
      },
    });
  } catch (error) {
    console.log(error);
    return {
      error: "Failed to unassign post from workplace",
    };
  }

  return {
    data: {
      message: "post unassigned from workplace",
    },
  };
};

export const unassignPostFromWorkplace = createSafeAction(
  UnassignPostFromWorkplace,
  handler
);
