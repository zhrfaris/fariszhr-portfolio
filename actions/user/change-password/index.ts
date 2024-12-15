"use server";

import { db } from "@/lib/db";
import { ChangePassword } from "./schema";
import { ReturnType, InputType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { auth } from "@/auth";
import { hashPassword } from "@/app/(private)/api/utils";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return {
      error: "Unauthorized",
    };
  }

  const { confirm_new_password, new_password, old_password } = data;

  const userExist = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!userExist) {
    return {
      error: "User not found",
    };
  }

  const oldPwHashed = hashPassword(old_password);

  if (userExist.password !== oldPwHashed) {
    return {
      error: "Invalid old password",
    };
  }

  if (new_password !== confirm_new_password) {
    return {
      error: "New Passwords Confirmation does not match",
    };
  }

  try {
    await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        password: hashPassword(new_password),
      },
    });
  } catch (error) {
    console.log(error);
    return {
      error: "Failed to update password",
    };
  }

  return {
    data: {
      message: "Successfully changed password",
    },
  };
};

export const changePassword = createSafeAction(ChangePassword, handler);
