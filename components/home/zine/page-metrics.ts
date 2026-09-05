import { ZINE_PAGE_ASPECT } from "@/content/home";

/** One page, spine at x = 0. */
export const PW = 1.0;
export const PH = ZINE_PAGE_ASPECT;

/** Transparent room around the paper for the fold to lift into. */
export const PADX = 0.1;
/**
 * Vertical room for the fold. The curl shader displaces a vertex along uDir by
 * (a + u) — up to 2u once past the curl radius — so a diagonal crease throws
 * geometry well outside the paper in y. For a corner grab (uDir.y ~ sin 45deg,
 * u ~ 1.2) the far corner lands ~0.34 beyond the page's half-height, and 0.15
 * only bought 0.20 of room, which is what was cutting the curl off square.
 * 0.40 gives 0.53 — about 1.6x the worst case that fold produces.
 *
 * Raising this only enlarges the transparent stage: world-units-per-pixel works
 * out to PH / zine height either way, so the paper renders at exactly the same
 * on-screen size. It does mean the canvas overlaps its neighbours, which is why
 * the canvas no longer takes pointer events — the paper does.
 */
export const PADY = 0.4;

/** Curl radius, tight as the fold extends. */
export const R_MAX = 0.115;
export const R_MIN = 0.026;

/** Full stage in book units, paper plus the fold's working room. */
export const FW = PW * (2 + 2 * PADX);
export const FH = PH * (1 + 2 * PADY);

/** The stage overhangs the paper by exactly that working room. */
export const stageInset = {
  left: `${-PADX * 50}%`,
  right: `${-PADX * 50}%`,
  top: `${-PADY * 100}%`,
  bottom: `${-PADY * 100}%`,
} as const;

export const sheetInset = `${((PADY / (1 + 2 * PADY)) * 100).toFixed(3)}% ${(
  (PADX / (2 + 2 * PADX)) *
  100
).toFixed(3)}%`;
