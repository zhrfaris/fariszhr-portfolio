import { Prisma } from "@prisma/client";
import { getUserById } from ".";

export type User = Prisma.PromiseReturnType<typeof getUserById>;
