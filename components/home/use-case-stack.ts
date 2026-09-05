"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

/**
 * The four case studies start life as one stacked deck sitting above the grid
 * heading, and deal themselves out into the real grid as the white surface
 * rises. Ported from docs/design/portfolio-scroll-prototype.html — the numbers
 * below are the validated ones, so treat them as spec rather than taste.
 *
 * Nothing here edits the grid: the cards are the server-rendered ShowcaseCard
 * elements, driven by inline transforms and handed back untouched the moment
 * they are at rest.
 *
 * The stacked state these constants describe is also written in CSS, in
 * home.module.css, so that the deck is already layered in the HTML's first
 * painted frame rather than appearing when hydration lands. The two have to
 * agree: change a number here and change it there.
 */

/**
 * The measurement has to land before the browser paints the frame it belongs
 * to, or the deck shows one frame of unstacked grid on every hand-off. On the
 * server there is no paint to be early for, and useLayoutEffect would only
 * warn, so it degrades to useEffect there.
 */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;


/* Stacked state: straight, no rotation, thin steps, each layer narrower and
   darker than the one in front.

   The depth caps at three tiers, so the deck reads as front + two strips the
   way every reference screenshot shows it. The cap applies to the vertical
   offset and the tone ONLY — width still steps once per card. That split is
   deliberate: the prototype capped all three together, which parked two cards
   on the identical spot and read as one card splitting in two on the way out.
   Keeping the width per-card means the fourth card sits concentrically inside
   the third — hidden behind it while stacked, never coincident with it — and
   still travels to its own grid slot. See TIER_TONES for the matching cap. */
const STEP_Y = 13;
const STEP_SX = 0.1;
const TIERS = 3;

/** Front to back, one per tier; cards past the last tier reuse it. */
const TIER_TONES = [245, 217, 192];

/** The tier a card is drawn at — capped, unlike its width. */
const tierOf = (i: number) => (i < TIERS ? i : TIERS - 1);
const STACK_W = 0.79; // front layer as a share of the grid column
const STACK_DROP = 14; // a small settle below the copy, nothing more

/** #f5f5f5 — the resting background the grid card already paints for itself. */
const FRONT_TONE = 245;
/** matches the radius in showcase-card.module.scss */
const RADIUS = 12;

/**
 * The card contents only fade up once the deck is nearly dealt out — and the
 * section heading rides the same ramp, so heading, card bodies and tags all
 * arrive together rather than the heading announcing a grid that is still a
 * blank stack.
 */
const CONTENT_FROM = 0.82;
const CONTENT_SPAN = 0.16;

const STACK_LIFT = 8;
const LIFT_DUR = 160;
/** front leads, each layer behind follows a beat later — both directions */
const LIFT_STAGGER = 45;

/**
 * Hover only hands off to the grid's own dark-invert once a card is truly at
 * rest. Anything short of exact still reads as "still moving" if the mouse
 * happens to already be sitting over its landing spot.
 */
const SETTLED = 0.9999;

/**
 * showcase-card.module.scss transitions `all .3s`, which would tween every
 * per-frame write this file makes: the transform would lag the scroll, the
 * tone would fade in over its own duration instead of being simply true on the
 * first frame, and measure() would read rects mid-tween. So while the deck is
 * in motion the card transitions nothing at all — the only thing that is ever
 * animated here is the hover lift, which asks for its transition explicitly.
 * At rest the card is handed back to the stylesheet, hover invert and all.
 */
const NO_TRANSITION = "none";

/**
 * Mobile is static by spec (docs/design/design.md) — no hover, no scroll
 * choreography, no card lift. 767px is the grid's own single-column
 * breakpoint, and the same one the card's dark-invert hover is scoped to.
 */
const MOBILE = "(max-width: 767px)";
const REDUCED = "(prefers-reduced-motion: reduce)";

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

type Layer = { dx: number; dy: number; sx: number; tone: number };

export type CaseStackRefs = {
  /** positioned wrapper around the server-rendered grid */
  hostRef: RefObject<HTMLDivElement>;
  /** transparent blanket that keeps the pointer off cards still in motion */
  blockerRef: RefObject<HTMLDivElement>;
  /** the deck itself: one hit target for the whole stack */
  deckRef: RefObject<HTMLButtonElement>;
  /** the section heading, revealed on the same ramp as the card contents */
  headingRef: RefObject<HTMLElement>;
};

export const useCaseStack = ({
  hostRef,
  blockerRef,
  deckRef,
  headingRef,
}: CaseStackRefs) => {
  const cardsRef = useRef<HTMLElement[]>([]);
  const layersRef = useRef<Layer[]>([]);

  const lastSRef = useRef(0);
  const measuredRef = useRef(false);
  const liftedRef = useRef(false);
  const settledRef = useRef(false);
  /** true whenever the deck must not animate at all: mobile, or reduced motion */
  const staticRef = useRef(false);
  const liftTimerRef = useRef<ReturnType<typeof setTimeout>>();

  /* the blanket is the only piece of this that React renders, so it is the
     only piece that needs state — everything else is written to the DOM */
  const [settled, setSettled] = useState(false);

  const findGrid = useCallback(() => {
    const host = hostRef.current;
    const grid = host?.querySelector<HTMLElement>("[data-case-grid]");
    if (!host || !grid) return null;
    const cards = Array.from(grid.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement,
    );
    return cards.length ? { host, grid, cards } : null;
  }, [hostRef]);

  /** the inner box ShowcaseCard paints its content into */
  const contentOf = (card: HTMLElement) =>
    card.firstElementChild instanceof HTMLElement ? card.firstElementChild : null;

  /** everything a frame paints, and nothing else */
  const stripCard = useCallback((card: HTMLElement) => {
    card.style.transform = "";
    card.style.borderRadius = "";
    card.style.backgroundColor = "";
    const content = contentOf(card);
    if (content) {
      content.style.transform = "";
      content.style.transformOrigin = "";
      content.style.opacity = "";
    }
  }, []);

  /** hand the card back to the grid exactly as it was rendered */
  const restCard = useCallback(
    (card: HTMLElement) => {
      stripCard(card);
      card.style.transition = "";
      card.style.transformOrigin = "";
      card.style.willChange = "";
      card.style.zIndex = "";
      card.removeAttribute("tabindex");
    },
    [stripCard],
  );

  /**
   * Crossing into (or back out of) the settled state. While the deck is in
   * motion it behaves as a single object — one hit target, nothing inside it
   * focusable — and at rest the cards are handed back exactly as rendered.
   */
  const applySettled = useCallback(
    (atRest: boolean) => {
      settledRef.current = atRest;
      setSettled(atRest);
      const cards = cardsRef.current;

      if (atRest) {
        // the pointer leaves with the blanket rather than by moving, so the
        // lift is dropped here as well as on pointerleave
        liftedRef.current = false;
        clearTimeout(liftTimerRef.current);
        cards.forEach(restCard);
        if (headingRef.current) headingRef.current.style.opacity = "";
        return;
      }

      cards.forEach((card, i) => {
        card.style.transformOrigin = "50% 0";
        card.style.willChange = "transform";
        card.style.transition = NO_TRANSITION;
        card.style.zIndex = String(cards.length - i);
        card.tabIndex = -1;
      });
    },
    [restCard, headingRef],
  );

  const paint = useCallback(
    (s: number) => {
      lastSRef.current = s;
      if (staticRef.current || !measuredRef.current) return;

      const atRest = s >= SETTLED;
      if (atRest !== settledRef.current) applySettled(atRest);
      if (atRest) return;

      const cards = cardsRef.current;
      const layers = layersRef.current;
      const inv = 1 - s;
      /* the lift fades out with inv on its own: by the time a card has settled
         there is nothing left to lift, so no separate settled-check is needed */
      const lift = liftedRef.current ? -STACK_LIFT * inv : 0;
      const reveal = clamp01((s - CONTENT_FROM) / CONTENT_SPAN).toFixed(3);

      const heading = headingRef.current;
      if (heading) heading.style.opacity = reveal;

      cards.forEach((card, i) => {
        const layer = layers[i];
        if (!layer) return;

        const sx = 1 + (layer.sx - 1) * inv;
        card.style.transform =
          `translate(${(layer.dx * inv).toFixed(2)}px,` +
          `${(layer.dy * inv + lift).toFixed(2)}px)` +
          ` scaleX(${sx.toFixed(4)})`;
        // scaleX would smear the corners into ellipses, so pre-divide the x radius
        card.style.borderRadius = `${(RADIUS / sx).toFixed(2)}px / ${RADIUS}px`;

        const tone = Math.round(layer.tone + (FRONT_TONE - layer.tone) * s);
        card.style.backgroundColor = `rgb(${tone},${tone},${tone})`;

        const content = contentOf(card);
        if (content) {
          // and undo the stretch on the contents, so type is never distorted
          content.style.transformOrigin = "50% 0";
          content.style.transform = `scaleX(${(1 / sx).toFixed(4)})`;
          content.style.opacity = reveal;
        }
      });

      const deck = deckRef.current;
      if (deck) deck.style.transform = `translateY(${lift.toFixed(2)}px)`;
    },
    [applySettled, deckRef, headingRef],
  );

  const measure = useCallback(() => {
    if (staticRef.current) return;
    const found = findGrid();
    if (!found) return;
    const { host, grid, cards } = found;
    const blocker = blockerRef.current;
    const deck = deckRef.current;
    if (!blocker || !deck) return;

    cardsRef.current = cards;
    /* Clear anything a previous frame wrote so the rects read below are the
       grid's own geometry — and cancel the transition first, or a tween still
       in flight leaves the card mid-transform while it is being measured. */
    cards.forEach((card) => {
      card.style.transition = "none";
      stripCard(card);
    });

    const g = grid.getBoundingClientRect();
    const ax = g.left + g.width / 2;
    const ay = g.top;

    layersRef.current = cards.map((card, i) => {
      const r = card.getBoundingClientRect();
      // the BACK tier sits at the grid's top edge, the front steps down from it
      const tier = tierOf(i);
      const fromBack = TIERS - 1 - tier;
      return {
        dx: ax - (r.left + r.width / 2),
        dy: ay + STACK_DROP + fromBack * STEP_Y - r.top,
        // width steps per card, never per tier — this is the collision guard
        sx: ((g.width * STACK_W) / r.width) * (1 - i * STEP_SX),
        tone: TIER_TONES[tier],
      };
    });

    /* the blanket covers the whole grid, not just the deck: the cards spread
       across it on their way out, and none of them may take a hover until the
       last one has landed */
    const h = host.getBoundingClientRect();
    blocker.style.top = `${g.top - h.top}px`;
    blocker.style.left = `${g.left - h.left}px`;
    blocker.style.width = `${g.width}px`;
    blocker.style.height = `${g.height}px`;

    // ...and the deck inside it is only the stack's own footprint
    const deckW = g.width * STACK_W;
    deck.style.left = `${((g.width - deckW) / 2).toFixed(2)}px`;
    deck.style.width = `${deckW.toFixed(2)}px`;
    deck.style.top = `${STACK_DROP}px`;
    deck.style.height = `${(TIERS - 1) * STEP_Y + cards[0].offsetHeight}px`;

    measuredRef.current = true;
    // applySettled owns the base styles the strip above cleared, so it is what
    // puts them back — including the transition the measurement suppressed
    if (settledRef.current) cards.forEach(restCard);
    else applySettled(false);
    paint(lastSRef.current);
  }, [findGrid, blockerRef, deckRef, stripCard, restCard, applySettled, paint]);

  /**
   * The deck lifts as one on hover/focus — not per-card, since it reads as one
   * stack of case studies, not four separately-hoverable tiles. The cascade
   * runs front-to-back either way: the front card leads and each layer behind
   * follows a beat later, same order lifting up and dropping back down.
   */
  const setLift = useCallback(
    (v: boolean) => {
      if (liftedRef.current === v || settledRef.current || staticRef.current)
        return;
      liftedRef.current = v;

      const cards = cardsRef.current;
      cards.forEach((card, i) => {
        card.style.transition = `transform ${LIFT_DUR}ms ease ${i * LIFT_STAGGER}ms`;
      });
      const deck = deckRef.current;
      if (deck) deck.style.transition = `transform ${LIFT_DUR}ms ease`;

      paint(lastSRef.current);

      /* the transition has to come back off, or the next scroll frame would be
         tweened towards its own target instead of tracking the scroll */
      clearTimeout(liftTimerRef.current);
      liftTimerRef.current = setTimeout(
        () => {
          cardsRef.current.forEach((card) => {
            card.style.transition = NO_TRANSITION;
          });
        },
        LIFT_DUR + (cards.length - 1) * LIFT_STAGGER + 60,
      );
    },
    [deckRef, paint],
  );

  /**
   * Re-decides whether the deck runs at all, then re-measures if it does. Every
   * trigger goes through here rather than straight to measure(), so crossing
   * the mobile breakpoint is caught by the plain resize that comes with it
   * instead of relying on a media-query change event.
   */
  const sync = useCallback(() => {
    const off =
      window.matchMedia(MOBILE).matches || window.matchMedia(REDUCED).matches;
    const wasOff = staticRef.current;
    staticRef.current = off;

    // the CSS baseline below only paints until this lands, either way
    if (hostRef.current) hostRef.current.dataset.stackReady = "";

    if (off) {
      if (wasOff) return; // already handed over; nothing left to undo
      cardsRef.current.forEach(restCard);
      if (headingRef.current) headingRef.current.style.opacity = "";
      measuredRef.current = false;
      settledRef.current = true;
      setSettled(true);
      return;
    }

    // coming back from static, the cards were handed to the grid and marked
    // settled — the deck has to be built again before paint can drive it
    if (wasOff) settledRef.current = false;
    measure();
  }, [measure, restCard, hostRef, headingRef]);

  useIsomorphicLayoutEffect(() => {
    const mobile = window.matchMedia(MOBILE);
    const reduced = window.matchMedia(REDUCED);

    sync();

    mobile.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    window.addEventListener("resize", sync);
    void document.fonts?.ready.then(sync);

    // the card copy rewrapping (webfont swap, zoom) changes the deck's footprint
    const ro = new ResizeObserver(sync);
    const found = findGrid();
    if (found) ro.observe(found.grid);

    return () => {
      mobile.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
      window.removeEventListener("resize", sync);
      ro.disconnect();
      clearTimeout(liftTimerRef.current);
    };
  }, [sync, findGrid]);

  return { paint, setLift, settled };
};
