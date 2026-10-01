/**
 * Shared Tailwind class strings for the public case-study page so the dashboard
 * Content-tab editor renders identically and the two can't drift apart. Used by
 * `portfolio-detail.tsx`, `portfolio-section.tsx`, and the editor's Content tab.
 */

/** Full-width cover band (height + background). Public adds flex alignment. */
export const COVER_WRAPPER_BASE =
  "h-[180px] md:h-[50vh] max-h-[500px] bg-[#f5f5f5] relative";

export const COVER_INNER = "size-full relative max-w-[1800px] mx-auto";

export const COVER_IMAGE = "size-full object-contain object-bottom md:object-cover";

/** Centered 640px reading column. */
export const DETAIL_COLUMN = "max-w-[640px] mx-auto space-y-8 py-6 md:py-12";

/** Workplace logo + categories header row. */
export const TITLE_HEADER_ROW = "portfolio-title-header flex items-center gap-4";
export const WORKPLACE_LOGO = "max-w-24 md:max-w-40 h-fit object-contain";
export const CATEGORY_ROW_TEXT = "text-xs md:text-base";

/** Case-study title. */
export const DETAIL_TITLE = "text-3xl md:text-5xl font-bold md:!leading-[3.75rem]";

/** Section body + section title typography. */
export const SECTION_BODY = "space-y-6 text-[15px] leading-[185%]";
export const SECTION_TITLE = "text-[15px] font-normal text-foreground/80 mb-3";
