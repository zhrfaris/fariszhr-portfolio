import { Prisma } from "@prisma/client";
import { getUserById } from ".";

type FullUser = NonNullable<Prisma.PromiseReturnType<typeof getUserById>>;

/** User as shown in the UI. Never carries the password hash. */
export type User = Omit<FullUser, "password"> | null;
