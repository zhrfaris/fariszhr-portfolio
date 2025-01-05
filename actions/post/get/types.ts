import { Prisma } from "@prisma/client";
import {
  getPosts,
  getPostById,
  getPostsShowCase,
  getPortfolioBySlug,
  getPostSectionsBySlug,
} from ".";

export type Posts = Prisma.PromiseReturnType<typeof getPosts>;
export type Post = Prisma.PromiseReturnType<typeof getPostById>;
export type Portfolio = Prisma.PromiseReturnType<typeof getPortfolioBySlug>;
export type PostsShowCase = Prisma.PromiseReturnType<typeof getPostsShowCase>;
export type PostSections = Prisma.PromiseReturnType<
  typeof getPostSectionsBySlug
>;
