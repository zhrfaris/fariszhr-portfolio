/**
 * Copy + asset manifest for the homepage hero and zine section.
 *
 * This is the only part of the site that reads its content from source — the
 * case studies below keep coming from the dashboard/DB. Components import from
 * here rather than hardcoding strings in JSX.
 */

export const heroContent = {
  title: "Humanizing technology through design",
  description:
    "I design location and mapping experiences at Gojek, shoot on film, and I'm currently building my first product below.",
} as const;

/**
 * NOT FINAL — placeholder copy. `title` and `description` are waiting on the
 * real words; do not ship with "[TBD]" on the page.
 */
export const zineContent = {
  title: "[TBD]",
  description: "[TBD]",
  badgeLabel: "Make your own zine — coming soon",
  prevLabel: "Previous spread",
  nextLabel: "Next spread",
} as const;

/**
 * Final, pre-composed page artwork. One image per page face, in numeric order:
 * page-01 is the left half of the opening spread, page-02 its right half, and
 * so on — so twelve images read as six spreads and five turns.
 *
 * Served as WebP (q82): the book is drawn in WebGL from the raw URL, so Next's
 * image optimizer never sees these files and the encoding has to be done ahead
 * of time. The source PNGs are kept alongside them at the same names.
 */
export const ZINE_PAGES = Array.from(
  { length: 12 },
  (_, i) => `/zine/page-${String(i + 1).padStart(2, "0")}.webp`,
);

/** Every page is 1440x1920, so one page is 3:4 and an open spread is 3:2. */
export const ZINE_PAGE_ASPECT = 1920 / 1440;

export const casesContent = {
  title: "Selected case studies",
  description: "Longer stories about how I solve problems with design.",
} as const;
