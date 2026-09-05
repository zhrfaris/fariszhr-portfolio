/**
 * Copy + asset manifest for the homepage hero and zine section.
 *
 * This is the only part of the site that reads its content from source — the
 * case studies below keep coming from the dashboard/DB. Components import from
 * here rather than hardcoding strings in JSX.
 */

/**
 * The identity line. `name` and `role` are fallbacks: when the dashboard has a
 * user record its own name/occupation win. Everything else — the connecting
 * word, the employer link and its logo — is copy, so it lives here rather than
 * in the component.
 */
export const identityContent = {
  name: "Muhammad Faris Azhar",
  role: "Product Designer",
  /** the line reads "<role> <connector> <employer logo>" */
  connector: "at",
  employer: {
    name: "Gojek",
    href: "https://gojek.design/",
    logo: { src: "/gojek-logo.png", width: 252, height: 72 },
  },
  portraitFallback: "/faris-profile-pict-grayscale.png",
  initials: "ZHR",
} as const;

export const heroContent = {
  title: "Humanizing technology through design",
  description:
    "I design location and mapping experiences at Gojek, shoot on film, and I'm currently building my first product below.",
} as const;

export const zineContent = {
  title: "Online Zine — a design engineering experiment",
  description:
    "As a photographer who happens to design for a living, I wanted to solve a problem I kept running into myself: photos that deserved more attention than a single post ever gave them. Online Zine is the tool I built to fix that.",
  badgeLabel: "Make your own zine —",
  /** rendered bold alongside badgeLabel */
  badgeEmphasis: "coming soon",
  prevLabel: "Previous spread",
  nextLabel: "Next spread",
} as const;

/**
 * Final, pre-composed page artwork. One image per page face, in numeric order:
 * page-01 is the left half of the opening spread, page-02 its right half, and
 * so on — so eight images read as four spreads. The book loops, so every
 * spread has a turn out of it in both directions.
 *
 * Served as WebP (q82): the book is drawn in WebGL from the raw URL, so Next's
 * image optimizer never sees these files and the encoding has to be done ahead
 * of time. The source PNGs are kept alongside them at the same names.
 */
export const ZINE_PAGES = Array.from(
  { length: 8 },
  (_, i) => `/zine/page-${String(i + 1).padStart(2, "0")}.webp`,
);

/** Every page is 1440x1920, so one page is 3:4 and an open spread is 3:2. */
export const ZINE_PAGE_ASPECT = 1920 / 1440;

export const casesContent = {
  title: "Selected case studies",
  description: "Longer stories about how I solve problems with design.",
} as const;
