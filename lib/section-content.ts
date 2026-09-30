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
