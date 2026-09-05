"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { useLenis } from "lenis/react";

import { isZineDragging } from "./zine/drag-state";

/**
 * The hero is pinned and the white case-study surface rises over it. Ported
 * from docs/design/portfolio-scroll-prototype.html — the numbers below are the
 * validated ones, so treat them as spec rather than taste.
 */

const REST_PAD = 26;
const MIN_PAD = 56;

/**
 * The settled block's own bottom reserve, fixed at 32px by the Figma frame's
 * `padding: 32px 0`. It used to be `min(58, vh * 0.06)` — a formula fitted to
 * one viewport height, which is what left the zine ~19px short of the
 * reference at 1440x820.
 */
const BREATHE = 32;

/** Only the last stretch of the rise commits; below it the scroll is left alone. */
const SNAP_FROM = 0.8;
const SNAP_TO = 0.995;
const SNAP_IDLE_MS = 130;
const SNAP_DURATION = 0.75;

/**
 * Below this the page is static by spec (docs/design/design.md): no pin, no
 * rise, no snap. Reduced motion opts out the same way, and 767px is the same
 * breakpoint the stacked deck uses, so hero, zine and cards switch together.
 */
const STATIC = "(max-width: 767px), (prefers-reduced-motion: reduce)";

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export type ChoreographyRefs = {
  rootRef: RefObject<HTMLDivElement>;
  trackRef: RefObject<HTMLDivElement>;
  heroRef: RefObject<HTMLElement>;
  headerRef: RefObject<HTMLElement>;
  zineRef: RefObject<HTMLElement>;
  footRef: RefObject<HTMLElement>;
  casesRef: RefObject<HTMLElement>;
  innerRef: RefObject<HTMLElement>;
};

export const useHomeChoreography = ({
  rootRef,
  trackRef,
  heroRef,
  headerRef,
  zineRef,
  footRef,
  casesRef,
  innerRef,
  onProgress,
}: ChoreographyRefs & {
  /** 0 = fully stacked, 1 = settled into the grid. Runs inside the scroll frame. */
  onProgress?: (s: number) => void;
}) => {
  const lenis = useLenis();

  /** Distance the surface has to travel before the hero is fully covered. */
  const coverRef = useRef(0);
  const centrePadRef = useRef(MIN_PAD);

  /* held in a ref so a changing callback identity never rebuilds the listeners */
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  /** true whenever the choreography must not run: mobile, or reduced motion */
  const staticRef = useRef(false);
  const lastYRef = useRef(0);
  const dirRef = useRef(1);
  const snappingRef = useRef(false);
  const snapTimerRef = useRef<ReturnType<typeof setTimeout>>();

  /**
   * The peek is reserved first: whatever height the stack and heading need is
   * taken off the top, and the zine is sized from what remains. Measuring the
   * other way round meant a tall hero could eat the peek — or worse, overlap
   * the copy once the webfont reflowed the text.
   */
  const layout = useCallback(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const hero = heroRef.current;
    const header = headerRef.current;
    const zine = zineRef.current;
    const foot = footRef.current;
    const cases = casesRef.current;
    const inner = innerRef.current;
    if (!root || !track || !hero || !header || !zine || !foot || !cases || !inner)
      return;

    const vh = window.innerHeight;
    /* Space held at the bottom of the hero for the deck to show through.
       Measured off docs/design/hero-default.png: the hero/surface boundary sits
       at y=719 in an 820px viewport, so the reference reserves 101px — 0.123 of
       the height, not the 0.26 this started with. The clamps are scaled by the
       same factor, so short and tall viewports keep their old proportions. */
    const peek = Math.min(Math.max(vh * 0.123, 97), 156);
    const breathe = BREATHE;
    hero.style.transform = "none";

    /* Read RESOLVED lengths off the elements. Custom properties come back as
       raw token strings, so parseFloat('clamp(...)') is NaN and every number
       downstream dies with it. */
    const gaps =
      parseFloat(getComputedStyle(zine).marginTop) +
      parseFloat(getComputedStyle(foot).marginTop);

    const chrome = header.offsetHeight + gaps + foot.offsetHeight + breathe;
    let zineH = Math.min(Math.max(vh - peek - chrome, 230), 520);
    if (!Number.isFinite(zineH)) zineH = 340;
    root.style.setProperty("--zineH", `${Math.round(zineH)}px`);

    // re-read after the zine resizes, so the edge always lands below the copy
    const heroEnd =
      foot.getBoundingClientRect().bottom -
      hero.getBoundingClientRect().top +
      breathe;
    hero.style.transform = "";

    const cover = Math.round(heroEnd);
    coverRef.current = cover;

    /* The hero only has to stay pinned until the surface has covered it, so the
       track is exactly that far plus one screen. A fixed 210vh left dead space
       below the case list, and scrolling into it un-pinned the hero again. */
    const trackH = cover + vh;
    track.style.height = `${trackH}px`;
    cases.style.marginTop = `${cover - trackH}px`;

    /* At full scroll the surface fills the viewport, so the content is padded
       to sit dead centre — equal space above the heading and below the footer.
       That padding would bury the stack at rest, so frame() slides the content
       back up by the difference until the surface has fully landed. */
    inner.style.transform = "none";
    inner.style.paddingTop = inner.style.paddingBottom = `${REST_PAD}px`;
    const contentH = inner.offsetHeight - REST_PAD * 2;

    /* The surface is exactly one viewport tall whenever the content fits, so
       the document ends precisely at the snap target: scrolling down lands here
       and stops, with no dead space left to drag through. */
    const boxH = Math.max(vh, contentH + MIN_PAD * 2);
    const centrePad = Math.round((boxH - contentH) / 2);
    centrePadRef.current = centrePad;
    inner.style.paddingTop = inner.style.paddingBottom = `${centrePad}px`;
    cases.style.height = `${boxH}px`;
  }, [rootRef, trackRef, heroRef, headerRef, zineRef, footRef, casesRef, innerRef]);

  const frame = useCallback(() => {
    const root = rootRef.current;
    const inner = innerRef.current;
    const cover = coverRef.current;
    if (staticRef.current || !root || !inner || !cover) return;

    const y = window.scrollY;
    const p = clamp01(y / cover);
    root.style.setProperty("--p", p.toFixed(4));

    // the surface doesn't just rise, it takes over: the grey behind it resolves
    // to white so the full-scroll state has no grey left anywhere
    const w = clamp01((p - 0.35) / 0.5);
    const v = Math.round(239 + (255 - 239) * w);
    root.style.setProperty("--bg", `rgb(${v},${v},${v})`);

    const s = easeOutCubic(clamp01((y - cover * 0.1) / (cover * 0.9)));
    const inv = 1 - s;

    inner.style.transform = `translateY(${(
      -(centrePadRef.current - REST_PAD) * inv
    ).toFixed(1)}px)`;

    onProgressRef.current?.(s);
  }, [rootRef, innerRef]);

  const refresh = useCallback(() => {
    layout();
    frame();
  }, [layout, frame]);

  /**
   * Undo every inline style layout() and frame() write, so the static layout is
   * the stylesheet's own. Without this, resizing down from a desktop width
   * would leave the pinned hero's track height and negative surface margin
   * behind and strand the page mid-choreography.
   */
  const reset = useCallback(() => {
    coverRef.current = 0;
    const root = rootRef.current;
    if (root) {
      root.style.removeProperty("--zineH");
      root.style.removeProperty("--p");
      root.style.removeProperty("--bg");
    }
    if (trackRef.current) trackRef.current.style.height = "";
    if (heroRef.current) heroRef.current.style.transform = "";
    const cases = casesRef.current;
    if (cases) {
      cases.style.marginTop = "";
      cases.style.height = "";
    }
    const inner = innerRef.current;
    if (inner) {
      inner.style.transform = "";
      inner.style.paddingTop = "";
      inner.style.paddingBottom = "";
    }
  }, [rootRef, trackRef, heroRef, casesRef, innerRef]);

  /**
   * Snap uses lenis.scrollTo, never window.scrollTo — the page is under Lenis's
   * smooth-scroll root, and a native scroll fights it instead of handing over.
   */
  const snapTo = useCallback(
    (target: number) => {
      if (!lenis) return;
      snappingRef.current = true;
      lenis.scrollTo(target, {
        duration: SNAP_DURATION,
        easing: easeInOutCubic,
        onComplete: () => {
          snappingRef.current = false;
        },
      });
      // onComplete does not fire if the user grabs the scroll mid-flight
      setTimeout(() => {
        snappingRef.current = false;
      }, SNAP_DURATION * 1000 + 120);
    },
    [lenis],
  );

  const snapToGrid = useCallback(() => {
    snapTo(coverRef.current);
  }, [snapTo]);

  const considerSnap = useCallback(() => {
    if (staticRef.current || snappingRef.current || !coverRef.current) return;
    if (isZineDragging()) return;
    const p = window.scrollY / coverRef.current;
    // downward only: scrolling back up out of the case list is never hijacked
    if (dirRef.current > 0 && p > SNAP_FROM && p < SNAP_TO) snapToGrid();
  }, [snapToGrid]);

  const onScroll = useCallback(() => {
    const y = window.scrollY;
    if (y !== lastYRef.current) {
      dirRef.current = y > lastYRef.current ? 1 : -1;
      lastYRef.current = y;
    }
    frame();
    clearTimeout(snapTimerRef.current);
    snapTimerRef.current = setTimeout(considerSnap, SNAP_IDLE_MS);
  }, [frame, considerSnap]);

  useLenis(onScroll);

  useEffect(() => {
    if (!rootRef.current) return;

    const mq = window.matchMedia(STATIC);

    /* Every trigger goes through here rather than straight to refresh(), so
       crossing the breakpoint is caught by the plain resize that comes with it
       instead of relying on a media-query change event. */
    const sync = () => {
      const off = mq.matches;
      const wasOff = staticRef.current;
      staticRef.current = off;
      if (off) {
        if (!wasOff) reset();
        return;
      }
      refresh();
    };

    sync();

    mq.addEventListener("change", sync);
    window.addEventListener("resize", sync);
    // Lenis owns the wheel, but keyboard/anchor scrolling still fires natively
    window.addEventListener("scroll", onScroll, { passive: true });
    document.fonts?.ready.then(sync);

    // the copy rewrapping (webfont swap, zoom) changes the hero height
    const ro = new ResizeObserver(sync);
    if (footRef.current) ro.observe(footRef.current);
    if (headerRef.current) ro.observe(headerRef.current);

    return () => {
      mq.removeEventListener("change", sync);
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", onScroll);
      ro.disconnect();
      clearTimeout(snapTimerRef.current);
    };
  }, [refresh, reset, onScroll, rootRef, footRef, headerRef]);

  return { refresh, snapToGrid, scrollToTop: () => lenis?.scrollTo(0) };
};
