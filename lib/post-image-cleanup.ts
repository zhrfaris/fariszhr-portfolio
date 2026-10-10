import { Post } from "@prisma/client";

import { db } from "@/lib/db";
import { parseSectionHtml } from "@/lib/section-content";

type PostImageFields = Pick<
  Post,
  "header_image" | "thumbnail_image" | "thumbnail_gif" | "post_sections"
>;

/**
 * Every Cloudinary public_id a post references: cover, thumbnail, GIF, the
 * legacy per-content `image`, and inline block-editor images
 * (`data-public-id` in the content HTML). May contain duplicates (a GIF's
 * derived thumbnail shares the GIF's public_id).
 */
export const postImagePublicIds = (post: PostImageFields): string[] => {
  const ids: string[] = [];
  const add = (id?: string | null) => {
    if (id) ids.push(id);
  };

  add(post.header_image?.public_id);
  add(post.thumbnail_image?.public_id);
  add(post.thumbnail_gif?.public_id);

  for (const section of post.post_sections ?? []) {
    for (const content of section.contents ?? []) {
      add(content.image?.public_id);
      for (const segment of parseSectionHtml(content.content ?? "")) {
        if (segment.type === "image") add(segment.image.publicId);
      }
    }
  }

  return ids;
};

/**
 * De-duplicate `candidateIds` and split them into ids that are safe to delete
 * from Cloudinary and ids still referenced elsewhere: by any post not in
 * `deletingPostIds` (image fields or inline content images), any workplace
 * logo, or any user photo. Read-only.
 */
export const partitionUnusedPublicIds = async (
  candidateIds: string[],
  deletingPostIds: string[]
): Promise<{ toDelete: string[]; inUse: string[] }> => {
  const unique = [...new Set(candidateIds)];
  if (unique.length === 0) return { toDelete: [], inUse: [] };

  const [otherPosts, workplaces, users] = await Promise.all([
    db.post.findMany({
      where: { id: { notIn: deletingPostIds } },
      select: {
        header_image: true,
        thumbnail_image: true,
        thumbnail_gif: true,
        post_sections: true,
      },
    }),
    db.workplace.findMany({ select: { image: true } }),
    db.user.findMany({ select: { photo: true } }),
  ]);

  const used = new Set<string>();
  for (const post of otherPosts) {
    for (const id of postImagePublicIds(post)) used.add(id);
  }
  for (const workplace of workplaces) {
    if (workplace.image?.public_id) used.add(workplace.image.public_id);
  }
  for (const user of users) {
    if (user.photo?.public_id) used.add(user.photo.public_id);
  }

  return {
    toDelete: unique.filter((id) => !used.has(id)),
    inUse: unique.filter((id) => used.has(id)),
  };
};
