import { Prisma } from "@prisma/client";
import { getPosts, getPostById } from ".";

export type Posts = Prisma.PromiseReturnType<typeof getPosts>;
export type Post = Prisma.PromiseReturnType<typeof getPostById>;
