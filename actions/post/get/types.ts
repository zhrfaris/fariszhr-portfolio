import { Prisma } from "@prisma/client";
import { getPosts, getPostById, getPostsShowCase } from ".";

export type Posts = Prisma.PromiseReturnType<typeof getPosts>;
export type Post = Prisma.PromiseReturnType<typeof getPostById>;
export type PostsShowCase = Prisma.PromiseReturnType<typeof getPostsShowCase>;
