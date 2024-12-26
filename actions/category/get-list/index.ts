"use server";

import { GetCategories } from "./schema";
import { ReturnType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { getCategoriesCombobox as fetchCategories } from "../get";
import { auth } from "@/auth";

const handler = async (): Promise<ReturnType> => {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return {
      error: "Unauthorized",
    };
  }

  let categories;

  try {
    categories = await fetchCategories();
  } catch (error) {
    console.log(error);
    return {
      error: "Failed to fetch categories",
    };
  }

  return {
    data: categories.map((p) => ({
      ...p,
      option_name: p.name,
    })),
  };
};

export const getCategoriesComboboxAction = createSafeAction(
  GetCategories,
  handler
);
