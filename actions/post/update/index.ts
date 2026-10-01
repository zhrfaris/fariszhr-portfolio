"use server";

import { db } from "@/lib/db";
import { UpdatePost } from "./schema";
import { revalidatePath } from "next/cache";
import { ReturnType, InputType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { auth } from "@/auth";
import slugify from "react-slugify";
import { encrypt } from "@/app/(private)/api/utils";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return {
      error: "Unauthorized",
    };
  }

  const {
    id,
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

  // Slug is derived from the title on every save (the field was removed from
  // the UI). When the derived slug collides with a *different* post, append
  // -2, -3, … until unique. A collision with this same post keeps the slug.
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let suffix = 2;
  while (true) {
    const existing = await db.post.findUnique({ where: { slug } });
    if (!existing || existing.id === id) break;
    slug = `${baseSlug}-${suffix++}`;
  }

  if (isRestricted) {
    if (!password || password.trim().length === 0) {
      return {
        error: "Password required when post restricted",
      };
    }
  }

  let post;

  try {
    post = await db.post.update({
      where: {
        id,
      },
      data: {
        title,
        slug,
        excerpt,
        header_image,
        thumbnail_image,
        thumbnail_gif,
        post_sections,
        status: status ?? "ACTIVE",
        categories: {
          connect: categoryIds ? categoryIds.map((id) => ({ id })) : [],
        },
        author: { connect: { id: session.user.id } },
        workplace: { connect: { id: workplaceId } },
        isRestricted,
        passwordHashed:
          isRestricted && password ? encrypt(password.trim()) : null,
        previewSectionAmount: isRestricted ? previewSectionAmount : null,
      },
    });
  } catch (error) {
    console.log(error);
    return {
      error: "Failed to update post",
    };
  }

  revalidatePath("/dashboard/posts");
  console.log(post);
  return { data: post };
};

export const updatePost = createSafeAction(UpdatePost, handler);
