import { Image as ImageType } from "@prisma/client";
import {
  ContentImageRadiusType,
  contentImageEnum,
} from "@/actions/post/create/schema";
import { PostSection, PostSectionContent } from "@/actions/post/create/types";

/** Section marker used to split the single-document body back into sections.
 * The Section block node serializes to <div data-section="true">Title</div>. */
export const SECTION_MARKER_ATTR = "data-section";

/** icon_type is never rendered on the public site, so the single-document flow
 * saves this constant instead of asking for an icon per section. */
export const DEFAULT_SECTION_ICON = "card_file_box";

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

/** Corner-radius in px for a given radius enum. Applied as an inline
 * border-radius (not a Tailwind class) because arbitrary classes like
 * `rounded-[16px]` living in lib/ are never generated — Tailwind only scans
 * pages/components/app. Shared by the editor and the public renderer so both
 * stay visually identical. */
export const RADIUS_PX: Record<ContentImageRadiusType, number> = {
  SM: 4,
  MD: 6,
  LG: 8,
  XL: 12,
  XXL: 16,
  XXXL: 24,
};

export const getRadiusPx = (radius?: ContentImageRadiusType | null): number =>
  radius ? (RADIUS_PX[radius] ?? RADIUS_PX.XXL) : RADIUS_PX.XXL;

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

const stripTags = (value: string) => value.replace(/<[^>]*>/g, "");

/**
 * Rebuild the single-document body HTML from stored post_sections. Each section
 * becomes a Section block (skipped when the title is empty — that content stays
 * as leading, header-less body) followed by its content, using the existing
 * backward-compat merge so old contents[] + separate images render inline.
 */
export const sectionsToDocumentHtml = (sections: PostSection[]): string => {
  return [...sections]
    .sort((a, b) => a.order - b.order)
    .map((section) => {
      const body = contentsToHtml(section.contents);
      const title = section.title?.trim();
      const header = title
        ? `<div ${SECTION_MARKER_ATTR}="true">${escapeAttr(title)}</div>`
        : "";
      return [header, body].filter(Boolean).join("\n");
    })
    .filter((chunk) => chunk.trim().length > 0)
    .join("\n");
};

/**
 * Split the single-document body HTML into post_sections at each Section block.
 * Content before the first Section block becomes a section with an empty title.
 * Output keeps the exact stored format (one PostSectionContent per section,
 * image: null, images inline in the HTML) — no schema change.
 */
export const documentHtmlToSections = (html: string): PostSection[] => {
  const sections: PostSection[] = [];
  const markerRegex = new RegExp(
    `<div\\b[^>]*\\b${SECTION_MARKER_ATTR}="true"[^>]*>([\\s\\S]*?)</div>`,
    "gi"
  );

  let order = 0;
  const pushSection = (title: string, contentHtml: string) => {
    const trimmed = contentHtml.trim();
    // Skip a completely empty leading section (doc starts with a Section block).
    if (!title && !trimmed) return;
    sections.push({
      id: crypto.randomUUID(),
      order: order++,
      title,
      icon_type: DEFAULT_SECTION_ICON,
      contents: trimmed ? htmlToContents(trimmed) : [],
    });
  };

  let lastIndex = 0;
  let currentTitle = "";
  let match: RegExpExecArray | null;

  while ((match = markerRegex.exec(html)) !== null) {
    const contentBefore = html.slice(lastIndex, match.index);
    pushSection(currentTitle, contentBefore);
    currentTitle = decodeEntities(stripTags(match[1])).trim();
    lastIndex = markerRegex.lastIndex;
  }

  pushSection(currentTitle, html.slice(lastIndex));

  return sections;
};
