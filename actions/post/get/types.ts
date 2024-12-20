import { Prisma } from "@prisma/client";
import { getCategoryById, getCategories } from ".";

export type Categories = Prisma.PromiseReturnType<typeof getCategories>;
export type Category = Prisma.PromiseReturnType<typeof getCategoryById>;
