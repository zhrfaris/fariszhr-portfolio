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

/** Workplace logo + categories header row. Mobile stacks the categories under
 * the logo; the -8px bottom margin takes the column's 32px gap to the title
 * down to 24px there. */
export const TITLE_HEADER_ROW =
  "portfolio-title-header flex flex-col items-start gap-2 max-md:-mb-2 md:flex-row md:items-center md:gap-4";
export const WORKPLACE_LOGO = "max-w-24 md:max-w-40 h-fit object-contain";
export const CATEGORY_ROW_TEXT =
  "text-xs leading-[18px] tracking-[0.4px] md:text-sm md:leading-5";

/** Case-study title. */
export const DETAIL_TITLE =
  "text-2xl font-semibold leading-8 tracking-[-0.3px] md:text-[32px] md:leading-10 md:tracking-[-0.5px]";

/** The first section after the title: on desktop 8px more than the column's
 * 32px gap, so the title is 40px above the first section heading. */
export const FIRST_SECTION = "md:pt-2";

/** Section body + section title typography (the body's own type is
 * `.section-richtext` in globals.css). Blocks are 24px apart, 32px on
 * desktop (paragraph ↔ image). */
export const SECTION_BODY = "space-y-6 md:space-y-8 text-[15px] leading-[185%]";
/** Rich-text class for section body HTML (block editor output). */
export const SECTION_RICHTEXT = "section-richtext";
export const SECTION_TITLE = "text-base leading-6 font-semibold text-foreground";
