"use server";

import { GetWorkplaces } from "./schema";
import { ReturnType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { getWorkplacesCombobox as fetchWorkplaces } from "../get";
import { auth } from "@/auth";

const handler = async (): Promise<ReturnType> => {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return {
      error: "Unauthorized",
    };
  }

  let workplaces;

  try {
    workplaces = await fetchWorkplaces();
  } catch (error) {
    console.log(error);
    return {
      error: "Failed to fetch workplaces",
    };
  }

  return {
    data: workplaces.map((p) => ({
      ...p,
      option_name: p.name,
    })),
  };
};

export const getWorkplacesComboboxAction = createSafeAction(
  GetWorkplaces,
  handler
);
