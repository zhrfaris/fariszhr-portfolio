"use server";

import { signIn } from "@/auth";
import { ActionState, createSafeAction } from "@/lib/create-safe-action";
import { signInSchema } from "@/lib/zod";
import { z } from "zod";

export type signInSc = z.infer<typeof signInSchema>;
export type Result = {
  message: string;
};

export const signInHandler = async (
  data: signInSc
): Promise<ActionState<signInSc, Result>> => {
  try {
    await signIn("credentials", {
      username: data.username,
      password: data.password,
      redirect: false,
    });

    return {
      data: { message: "Successfully signed in" },
    };
  } catch (error) {
    console.log(error);
    return {
      error: `Invalid credentials: ${error}`,
    };
  }
};

export const signInAction = createSafeAction(signInSchema, signInHandler);
