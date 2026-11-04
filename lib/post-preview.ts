import { Image as ImageType } from "@prisma/client";
import { Portfolio } from "@/actions/post/get/types";
import { PostSection } from "@/actions/post/create/types";

/*
 * Case study preview: the editor hands its current (unsaved) state to the
 * preview tab through localStorage, and pings open preview tabs over a
 * BroadcastChannel so they re-read it. Nothing touches the database.
 */

export const previewStorageKey = (postId: string) => `preview:${postId}`;
export const previewChannelName = (postId: string) => `preview:${postId}`;

/** The editor fields the public case study page renders. */
export interface PostPreviewData {
  title: string;
  excerpt: string;
  header_image: ImageType | null;
  categories: { id: string; name: string }[];
  workplace: { id: string; name: string; image: ImageType } | null;
  post_sections: PostSection[];
  updatedAt: number;
}

export function readPreview(postId: string): PostPreviewData | null {
  try {
    const raw = localStorage.getItem(previewStorageKey(postId));
    return raw ? (JSON.parse(raw) as PostPreviewData) : null;
  } catch {
    return null;
  }
}

export function writePreview(postId: string, data: PostPreviewData) {
  try {
    localStorage.setItem(previewStorageKey(postId), JSON.stringify(data));
  } catch {
    // Storage full/blocked: the preview falls back to the saved draft.
  }
  try {
    const channel = new BroadcastChannel(previewChannelName(postId));
    channel.postMessage("update");
    channel.close();
  } catch {
    // No BroadcastChannel: the "storage" event still reaches other tabs.
  }
}

export function clearPreview(postId: string) {
  try {
    localStorage.removeItem(previewStorageKey(postId));
  } catch {}
}

/**
 * Lay the editor's state over the saved post so the result has exactly the
 * shape the public page's <PortfolioDetail> expects.
 */
export function mergePreview(
  saved: NonNullable<Portfolio>,
  preview: PostPreviewData | null
): NonNullable<Portfolio> {
  if (!preview) return saved;

  return {
    ...saved,
    title: preview.title,
    excerpt: preview.excerpt,
    header_image: preview.header_image ?? saved.header_image,
    // Only id/name are rendered; keep the saved records' other fields.
    categories: preview.categories.map((c) => ({
      ...(saved.categories.find((s) => s.id === c.id) ?? saved.categories[0]),
      id: c.id,
      name: c.name,
    })) as NonNullable<Portfolio>["categories"],
    workplace: preview.workplace
      ? ({
          ...saved.workplace,
          id: preview.workplace.id,
          name: preview.workplace.name,
          image: preview.workplace.image,
        } as NonNullable<Portfolio>["workplace"])
      : null,
    // Stable ids so React keeps section components (and loaded images)
    // mounted across live updates instead of remounting every keystroke.
    post_sections: preview.post_sections.map((section, i) => ({
      ...section,
      id: `preview-section-${i}`,
      contents: section.contents.map((content, j) => ({
        ...content,
        id: `preview-content-${i}-${j}`,
      })),
    })) as NonNullable<Portfolio>["post_sections"],
  };
}
