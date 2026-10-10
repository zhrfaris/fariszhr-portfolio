"use server";

import { db } from "@/lib/db";
import { CreatePost } from "./schema";
import { revalidatePath } from "next/cache";
import { ReturnType, InputType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import slugify from "react-slugify";
import { auth } from "@/auth";
import { encrypt } from "@/app/(private)/api/utils";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return {
      error: "Unauthorized",
    };
  }

  const {
    excerpt,
    header_image,
    post_sections,
    status,
    thumbnail_image,
    title,
    categoryIds,
    thumbnail_gif,
    workplaceId,
    isRestricted,
    password,
    previewSectionAmount,
  } = data;

  // Slug is always derived from the title (the field was removed from the UI).
  // If the base slug is taken, append -2, -3, … until it is unique.
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let suffix = 2;
  while (await db.post.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  if (isRestricted) {
    if (!password || password.trim().length === 0) {
      return {
        error: "Password required when post restricted",
      };
    }
  }

  const postsLength = await db.post.count();
  const finalStatus = status ?? "ACTIVE";

  let post;

  try {
    post = await db.post.create({
      data: {
        title,
        slug,
        excerpt,
        header_image,
        thumbnail_image,
        thumbnail_gif,
        post_sections,
        order: postsLength,
        status: finalStatus,
        publishedAt: finalStatus === "ACTIVE" ? new Date() : null,
        categories: {
          connect: categoryIds ? categoryIds.map((id) => ({ id })) : [],
        },
        author: { connect: { id: session.user.id } },
        workplace: { connect: { id: workplaceId } },
        isRestricted,
        passwordHashed: password ? encrypt(password.trim()) : undefined,
        previewSectionAmount,
      },
    });
  } catch (error) {
    console.log(error);
    return {
      error: "Failed to create post",
    };
  }

  revalidatePath("/dashboard/posts");
  return { data: post };
};

export const createPost = createSafeAction(CreatePost, handler);
