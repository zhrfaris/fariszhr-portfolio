"use server";

import { db } from "@/lib/db";
import { DeleteManyWorkplaces } from "./schema";
import { revalidatePath } from "next/cache";
import { ReturnType, InputType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { auth } from "@/auth";
import {
  destroyCloudinaryImage,
  initializeCloudinary,
} from "@/lib/cloudinary-lib";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return {
      error: "Unauthorized",
    };
  }

  const { ids } = data;

  // delete image from cloudinary storage
  const allWorkplacesTransaction = ids.map((id) =>
    db.workplace.findUnique({
      where: {
        id,
      },
    })
  );

  const allCoverPublicIds: string[] = [];

  const workplacesToDelete = await db.$transaction(allWorkplacesTransaction);

  for (const workplace of workplacesToDelete) {
    if (!!workplace?.image?.public_id) {
      allCoverPublicIds.push(workplace?.image?.public_id);
    }
  }

  if (allCoverPublicIds.length > 0) {
    try {
      // Call Cloudinary directly: a server-side fetch to /api/image/delete
      // carries no session cookie and would be rejected with 401.
      initializeCloudinary();
      await destroyCloudinaryImage(allCoverPublicIds);
    } catch (error) {
      console.log(error);
      return {
        error: "Error while deleting posts images",
      };
    }
  }

  // remove all connections
  try {
    const unassignTransactions = ids.map((id) =>
      db.workplace.update({
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

  let workplaces;

  try {
    const transactions = ids.map((id) =>
      db.workplace.delete({
        where: {
          id: id,
        },
      })
    );

    workplaces = await db.$transaction(transactions);
  } catch (error) {
    console.log(error);
    return {
      error: "Failed to delete selected workplaces",
    };
  }

  revalidatePath("/dashboard/workplaces");
  return { data: workplaces };
};

export const deleteManyWorkplaces = createSafeAction(
  DeleteManyWorkplaces,
  handler
);
