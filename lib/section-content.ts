import { Image as ImageType } from "@prisma/client";
import {
  ContentImageRadiusType,
  contentImageEnum,
} from "@/actions/post/create/schema";
import { PostSectionContent } from "@/actions/post/create/types";

/**
 * Shared contract for inline Cloudinary images inside section HTML.
 *
 * The block editor's custom image node, the backward-compat loader below, and
 * the public renderer (`portfolio-section.tsx`) all rely on these attribute
 * names. An inline image is a plain <img> that additionally carries the
 * Cloudinary metadata we need to render it with next/image (blur placeholder,
 * intrinsic size, radius, and the public_id for deletion).
 */
export const IMAGE_ATTR = {
  publicId: "data-public-id",
  placeholder: "data-placeholder",
  thumbnail: "data-thumbnail",
  width: "data-width",
  height: "data-height",
  imgType: "data-img-type",
  radius: "data-radius",
} as const;

export const DEFAULT_INLINE_RADIUS: ContentImageRadiusType = "XXL";

/** Tailwind rounded-* class for a given radius enum. Shared by the editor and
 * the public renderer so both stay visually identical. */
export const getRadiusClass = (
  radius?: ContentImageRadiusType | null
): string => {
  switch (radius) {
    case "SM":
      return "rounded-[4px]";
    case "MD":
      return "rounded-[6px]";
    case "LG":
      return "rounded-[8px]";
    case "XL":
      return "rounded-[12px]";
    case "XXL":
      return "rounded-[16px]";
    case "XXXL":
      return "rounded-[24px]";
    default:
      return "rounded-[16px]";
  }
};

const escapeAttr = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/**
 * Serialize a Cloudinary Image (the old separate `content.image`) into the
 * inline <img> markup understood by the editor and the public renderer.
 */
export const imageToHtml = (
  image: ImageType,
  radius?: ContentImageRadiusType | null
): string => {
  const attrs: Record<string, string> = {
    src: image.img_url,
    alt: "",
    [IMAGE_ATTR.publicId]: image.public_id ?? "",
    [IMAGE_ATTR.placeholder]: image.img_url_placeholder ?? "",
    [IMAGE_ATTR.thumbnail]: image.img_url_thumbnail ?? "",
    [IMAGE_ATTR.width]: String(image.img_width ?? ""),
    [IMAGE_ATTR.height]: String(image.img_height ?? ""),
    [IMAGE_ATTR.imgType]: image.img_type ?? "",
    [IMAGE_ATTR.radius]: radius ?? DEFAULT_INLINE_RADIUS,
  };

  const attrString = Object.entries(attrs)
    .map(([key, value]) => `${key}="${escapeAttr(value)}"`)
    .join(" ");

  return `<img ${attrString} />`;
};

/**
 * Merge a section's existing `contents[]` (as authored by the old TinyMCE flow)
 * into a single HTML document for the block editor. Each item's HTML is kept in
 * order, and any separate image is appended right after its HTML as an inline
 * image node carrying its radius — preserving the previous visual order.
 */
export const contentsToHtml = (contents: PostSectionContent[]): string => {
  return [...contents]
    .sort((a, b) => a.order - b.order)
    .map((content) => {
      const html = content.content ?? "";
      if (content.image) {
        return `${html}${imageToHtml(content.image, content.content_image_radius)}`;
      }
      return html;
    })
    .filter((chunk) => chunk.trim().length > 0)
    .join("\n");
};

export interface ParsedInlineImage {
  src: string;
  placeholder: string;
  width: number | null;
  height: number | null;
  radius: ContentImageRadiusType;
  publicId: string;
}

export type ParsedSegment =
  | { type: "html"; html: string }
  | { type: "image"; image: ParsedInlineImage };

const decodeEntities = (value: string) =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

const getTagAttr = (tag: string, attr: string): string => {
  const match = tag.match(new RegExp(`(?:\\s)${attr}="([^"]*)"`, "i"));
  return match ? decodeEntities(match[1]) : "";
};

const toIntOrNull = (value: string): number | null => {
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? null : n;
};

/**
 * Split a section's HTML into ordered segments of rich-text HTML and inline
 * images. Uses a regex (no DOM) so it is safe to run during SSR. Inline images
 * are always top-level siblings in the editor output, so this is sufficient.
 */
export const parseSectionHtml = (html: string): ParsedSegment[] => {
  if (!html) return [];

  const segments: ParsedSegment[] = [];
  const imgRegex = /<img\b[^>]*>/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = imgRegex.exec(html)) !== null) {
    const before = html.slice(lastIndex, match.index);
    if (before.trim()) segments.push({ type: "html", html: before });

    const tag = match[0];
    segments.push({
      type: "image",
      image: {
        src: getTagAttr(tag, "src"),
        placeholder: getTagAttr(tag, IMAGE_ATTR.placeholder),
        width: toIntOrNull(getTagAttr(tag, IMAGE_ATTR.width)),
        height: toIntOrNull(getTagAttr(tag, IMAGE_ATTR.height)),
        radius:
          (getTagAttr(tag, IMAGE_ATTR.radius) as ContentImageRadiusType) ||
          DEFAULT_INLINE_RADIUS,
        publicId: getTagAttr(tag, IMAGE_ATTR.publicId),
      },
    });

    lastIndex = imgRegex.lastIndex;
  }

  const rest = html.slice(lastIndex);
  if (rest.trim()) segments.push({ type: "html", html: rest });

  return segments;
};

/**
 * Collapse the block editor's HTML output into a single PostSectionContent.
 * Images live inline in the HTML, so the separate `image` field is always null.
 * Reuses the first existing content id when re-saving so the record is stable.
 */
export const htmlToContents = (
  html: string,
  existing?: PostSectionContent[]
): PostSectionContent[] => {
  return [
    {
      id: existing?.[0]?.id ?? crypto.randomUUID(),
      order: 0,
      content: html,
      image: null,
      content_image_type: contentImageEnum.Values.DEFAULT,
      content_image_radius: null,
    },
  ];
};
