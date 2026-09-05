import { ZINE_PAGE_ASPECT } from "@/content/home";

/** One page, spine at x = 0. */
export const PW = 1.0;
export const PH = ZINE_PAGE_ASPECT;

/** Transparent room around the paper for the fold to lift into. */
export const PADX = 0.1;
export const PADY = 0.15;

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
