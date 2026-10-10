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

  const current = await db.post.findUnique({
    where: { id },
    select: { slug: true, status: true, publishedAt: true },
  });
  if (!current) {
    return {
      error: "Post not found",
    };
  }

  const finalStatus = status ?? "ACTIVE";
  const wasLive = !!current.publishedAt || current.status === "ACTIVE";

  // A post that has ever been Live keeps its slug so public links never
  // break, even if it is moved back to Draft. `status === ACTIVE` also counts
  // for posts published before `publishedAt` existed. Otherwise the slug
  // follows the title (the field was removed from the UI); when the derived
  // slug collides with a *different* post, append -2, -3, … until unique.
  // A collision with this same post keeps it.
  let slug = current.slug;
  if (!wasLive) {
    const baseSlug = slugify(title);
    slug = baseSlug;
    let suffix = 2;
    while (true) {
      const existing = await db.post.findUnique({ where: { slug } });
      if (!existing || existing.id === id) break;
      slug = `${baseSlug}-${suffix++}`;
    }
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
        status: finalStatus,
        // Stamp the first publish; older Live posts get it on their next save.
        ...(!current.publishedAt &&
          (current.status === "ACTIVE" || finalStatus === "ACTIVE") && {
            publishedAt: new Date(),
          }),
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

  // Revalidate with the final slug (and the old one if it changed).
  revalidatePath("/dashboard/posts");
  revalidatePath("/");
  for (const path of new Set([post.slug, current.slug])) {
    revalidatePath(`/portfolios/${path}`);
    revalidatePath(`/dashboard/posts/${path}/edit`);
  }
  console.log(post);
  return { data: post };
};

export const updatePost = createSafeAction(UpdatePost, handler);
