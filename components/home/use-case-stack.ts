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
 * agree: change a number here — or the width of the content column those CSS
 * values are resolved against — and change it there.
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
 * The heading reserves layout height the deck offsets while it is hidden; this
 * ramp is what hands that height back. It is layout compensation only — the
 * content reveal itself is no longer scroll-linked (see FADE_MS).
 */
const RESERVE_FROM = 0.82;
const RESERVE_SPAN = 0.16;

/**
 * Card bodies, tags and the heading stay at zero for the whole scroll-driven
 * approach, then rise into place the moment the deck is genuinely at rest —
 * a short lift plus a fade on an ease-out, so the content arrives rather than
 * simply appearing. Deliberately the opposite character to the card's hover,
 * which is instant. Applied as a transition for the duration and then taken
 * back off, the same lifecycle as the hover lift, so it never fights a
 * scroll-driven write.
 */
/**
 * Hybrid reveal: scroll decides *when*, the clock decides *how long*. Content
 * stays hidden until the deck is nearly home, then rises on its own eased
 * transition — so the motion reads the same whether the reader eases in or
 * flicks through. Tying opacity straight to s made the duration whatever the
 * scroll happened to cover, which is what felt rushed.
 *
 * Crossing the threshold in either direction runs the same transition, so
 * scrolling back up is the reveal in reverse rather than a snap.
 */
const REVEAL_AT = 0.92;
const REVEAL_MS = 700;
const REVEAL_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
const REVEAL_LIFT = 16;

/** No hover-lift while the page is moving; cleared this long after the last frame. */
const SCROLL_IDLE_MS = 140;

/**
 * Depth never falls all the way to nothing. Zeroing it removed the doubled edge
 * where converging tiers put their inset bands a few px apart, but it also left
 * every card a flat #f5f5f5 rectangle — same fill, same border colour, no inset
 * — for the whole stretch before the reveal, which read as a white blink. A
 * floor keeps the bands soft enough not to stack while the cards still look
 * like cards.
 */
const DEPTH_FLOOR = 0.5;

/** eased 0..1, flat at both ends — no velocity step where a ramp begins or ends */
const smoothstep = (t: number) => t * t * (3 - 2 * t);

/**
 * The stacked depth treatment is at full strength while the tiers are still
 * clearly apart, off while they cross, and back only once the cards have
 * separated into their own slots — which happens later than the content
 * reveal, so it gets its own window rather than sharing that ramp.
 */
const DEPTH_HOLD = 0.3;
/**
 * Measured, not chosen: adjacent cards in a row overlap by 48px at s=0.90,
 * 16px at 0.95, and exactly 0 at 0.975 — so the doubled-edge risk this hold
 * exists to suppress decays linearly to nothing across that stretch. The
 * return therefore tracks the overlap decay rather than waiting for it to
 * finish: it starts while the bands still overlap but is weak there, and only
 * reaches full once they have separated.
 *
 * It ends at 0.99, deliberately short of the settle boundary, so the last
 * hundredth of the scroll changes nothing at all and the hand-off from the
 * inline values to the CSS fallbacks is a no-op by construction.
 */
const DEPTH_RETURN_FROM = 0.9;
const DEPTH_RETURN_SPAN = 0.09;

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

  /** the heading's own height + margin, which the deck offsets while hidden */
  const headReserveRef = useRef(0);
  const lastSRef = useRef(0);
  const measuredRef = useRef(false);
  const liftedRef = useRef(false);
  /* what the pointer wants, kept apart from what the deck is doing: a hover
     that arrives mid-scroll is remembered and honoured once the page stops,
     rather than dropped on the floor until the cursor moves again */
  const hoverRef = useRef(false);
  const applyLiftRef = useRef<() => void>();
  const settledRef = useRef(false);
  /** true whenever the deck must not animate at all: mobile, or reduced motion */
  const staticRef = useRef(false);
  const liftTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const revealTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const shownRef = useRef(false);
  const scrollingRef = useRef(false);
  const scrollIdleRef = useRef<ReturnType<typeof setTimeout>>();

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

  /**
   * Everything that rises into place together: each card's thumbnail/text row
   * and tag row, plus the section heading. The wrapper itself is not in here —
   * it carries the counter-scale and, with its shadow dropped, paints nothing.
   */
  const risers = useCallback(() => {
    const out: HTMLElement[] = [];
    cardsRef.current.forEach((card) => {
      const content = contentOf(card);
      if (!content) return;
      Array.from(content.children).forEach((el) => {
        if (el instanceof HTMLElement) out.push(el);
      });
    });
    const heading = headingRef.current;
    if (heading) out.push(heading);
    return out;
  }, [headingRef]);

  const hide = (el: HTMLElement) => {
    el.style.transform = `translateY(${REVEAL_LIFT}px)`;
    el.style.opacity = "0";
  };
  const show = (el: HTMLElement) => {
    el.style.transform = "";
    el.style.opacity = "";
  };

  /** everything a frame paints, and nothing else */
  const stripCard = useCallback((card: HTMLElement) => {
    card.style.transform = "";
    card.style.borderRadius = "";
    card.style.removeProperty("--deck-tone");
    const content = contentOf(card);
    if (content) {
      content.style.transform = "";
      content.style.transformOrigin = "";
      content.style.opacity = "";
    }
  }, []);

  /**
   * Settling is NOT the same as releasing. Dropping will-change, z-index and
   * the transform together destroyed every card's compositing layer in the one
   * frame that also enabled hover, and re-rasterising eight elements at once —
   * text antialiasing included — is the flash seen the moment a card became
   * hoverable. Nothing about the colour, the geometry or the hover rule changed
   * there; only whether the card was still its own layer.
   *
   * So the promotions stay and only the values are normalised. The card keeps
   * will-change, z-index, transform-origin and its (now identity) transform,
   * and gets its tab stop back. restCard below is the real release, for when
   * the deck is genuinely torn down.
   */
  const settleCard = useCallback(
    (card: HTMLElement) => {
      card.style.transform = "translate(0px, 0px) scaleX(1)";
      card.style.borderRadius = "";
      card.style.removeProperty("--deck-tone");
      card.removeAttribute("tabindex");
      const content = contentOf(card);
      if (content) content.style.transform = "scaleX(1)";
    },
    [],
  );

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
        hoverRef.current = false;
        clearTimeout(liftTimerRef.current);
        cards.forEach(settleCard);
        /* The curve is already at 1 by the time this runs, so handing the
           resting values back changes nothing on screen — it only stops the
           per-frame writes. */
        risers().forEach(show);
        if (hostRef.current) {
          hostRef.current.style.transform = "";
          hostRef.current.style.removeProperty("--deck-depth");
          hostRef.current.style.removeProperty("--deck-nested");
        }
        return;
      }

      if (!shownRef.current) {
        risers().forEach((el) => {
          el.style.transition = "";
          hide(el);
        });
      }

      cards.forEach((card, i) => {
        card.style.transformOrigin = "50% 0";
        card.style.willChange = "transform";
        card.style.transition = NO_TRANSITION;
        card.style.zIndex = String(cards.length - i);
        card.tabIndex = -1;
      });
    },
    [settleCard, hostRef, risers],
  );

  const paint = useCallback(
    (s: number) => {
      const prev = lastSRef.current;
      lastSRef.current = s;
      if (staticRef.current || !measuredRef.current) return;

      /* The signal is the scroll having actually moved, not paint having been
         called. applyLift repaints at the same s to put the lift on screen, so
         keying off the call would have the lift cancel itself the moment it was
         applied — which is exactly what it did. A lift armed while the page is
         moving tweens every scroll-driven transform for its 160ms and reads as
         a shake, so it is dropped for as long as the scroll is live. */
      if (s !== prev) {
        scrollingRef.current = true;
        if (liftedRef.current) {
          liftedRef.current = false;
          clearTimeout(liftTimerRef.current);
          cardsRef.current.forEach((card) => {
            card.style.transition = NO_TRANSITION;
          });
        }
        clearTimeout(scrollIdleRef.current);
        scrollIdleRef.current = setTimeout(() => {
          scrollingRef.current = false;
          // the cursor may have come to rest over the deck while it was moving
          applyLiftRef.current?.();
        }, SCROLL_IDLE_MS);
      }

      const atRest = s >= SETTLED;
      if (atRest !== settledRef.current) applySettled(atRest);
      if (atRest) return;

      const cards = cardsRef.current;
      const layers = layersRef.current;
      const inv = 1 - s;
      /* the lift fades out with inv on its own: by the time a card has settled
         there is nothing left to lift, so no separate settled-check is needed */
      const lift = liftedRef.current ? -STACK_LIFT * inv : 0;
      /* Only the cards that own a tier lift. Anything past TIERS is nested
         inside the back tier and invisible, and giving it a staggered lift of
         its own made it lag its tier-mate mid-transition and peek out. It now
         holds still, which keeps it occluded through the whole animation. */
      /* Nothing is revealed until settle: this only closes the heading's reserve.
         Eased, not linear — the host's translateY carries the whole deck region,
         heading included, and a linear ramp clamped at RESERVE_FROM + SPAN was
         travelling ~510px per unit s and then stopping dead at s=0.98 while the
         cards themselves kept converging to 0.9999. The value was continuous but
         its first derivative was not, and a whole block halting mid-motion is
         exactly the kind of hitch that reads as a flash. Smoothstep brings it to
         rest with zero velocity instead. */
      const revealed = smoothstep(clamp01((s - RESERVE_FROM) / RESERVE_SPAN));

      /* Crossing the threshold arms the transition and sets the target once;
         nothing is written per frame, so the scroll cannot re-trigger it. */
      const wantShown = s >= REVEAL_AT;
      if (wantShown !== shownRef.current) {
        shownRef.current = wantShown;
        const els = risers();
        const ease =
          `opacity ${REVEAL_MS}ms ${REVEAL_EASE},` +
          ` transform ${REVEAL_MS}ms ${REVEAL_EASE}`;
        els.forEach((el) => {
          el.style.transition = ease;
        });
        els.forEach(wantShown ? show : hide);
        clearTimeout(revealTimerRef.current);
        revealTimerRef.current = setTimeout(() => {
          els.forEach((el) => {
            el.style.transition = "";
          });
        }, REVEAL_MS + 60);
      }

      /* The heading is back in flow but still invisible, so the whole deck
         region rides up by the height it reserves and gives it back exactly as
         the heading fades in. Done as a transform rather than a layout change:
         the cards' slots are measured from this layout, so collapsing it for
         real would move their targets mid-flight. */
      /* The tiers sit 13px apart while stacked but converge to nothing as they
         deal out, and each card's inset band is ~6px thick — so through the
         middle of the range two bands land within a few px of each other and
         read as one doubled edge. Depth is therefore full while the deck is
         genuinely stacked, off through the crossing, and back with the content
         reveal once the cards are separate grid cards again. One scalar, on the
         host, so the treatment itself stays static CSS. */
      const stacked = clamp01((inv - DEPTH_HOLD) / (1 - DEPTH_HOLD));
      /* Blended, not max()'d. Taking the larger of the floor and a linear ramp
         left the floor winning until the ramp crossed it, which put a hard
         velocity step at s=0.975: depth sat flat for the whole scroll and then
         doubled the front card's inset over the last 2.5% — 2-3 frames, and
         the flash. Easing from the floor to full removes the step entirely. */
      const returning = smoothstep(
        clamp01((s - DEPTH_RETURN_FROM) / DEPTH_RETURN_SPAN),
      );
      const base = Math.max(stacked, DEPTH_FLOOR);
      const depth = base + (1 - base) * returning;
      /* The back tiers' softened inset is a stack treatment, so it has to be
         gone by the time they are plain grid cards — and gone *continuously*,
         or the frame that drops it flashes. It rides the depth's own return
         ramp: full while they are still tiers, zero at rest, where it equals
         the resting shadow exactly. */
      const nested = 1 - returning;
      const host = hostRef.current;
      if (host) {
        host.style.setProperty("--deck-depth", depth.toFixed(3));
        host.style.setProperty("--deck-nested", nested.toFixed(3));
        host.style.transform = `translateY(${(
          -headReserveRef.current * (1 - revealed)
        ).toFixed(2)}px)`;
      }

      cards.forEach((card, i) => {
        const layer = layers[i];
        if (!layer) return;

        const sx = 1 + (layer.sx - 1) * inv;
        const cardLift = i < TIERS ? lift : 0;
        card.style.transform =
          `translate(${(layer.dx * inv).toFixed(2)}px,` +
          `${(layer.dy * inv + cardLift).toFixed(2)}px)` +
          ` scaleX(${sx.toFixed(4)})`;
        // scaleX would smear the corners into ellipses, so pre-divide the x radius
        card.style.borderRadius = `${(RADIUS / sx).toFixed(2)}px / ${RADIUS}px`;

        /* The only thing here that changes continuously is the tone itself, so
           that is all the frame writes. Its border, inset shadow and radius are
           static CSS keyed to the tier — set once, never re-applied. */
        const tone = Math.round(layer.tone + (FRONT_TONE - layer.tone) * s);
        card.style.setProperty("--deck-tone", `rgb(${tone},${tone},${tone})`);

        const content = contentOf(card);
        if (content) {
          // and undo the stretch on the contents, so type is never distorted
          content.style.transformOrigin = "50% 0";
          content.style.transform = `scaleX(${(1 / sx).toFixed(4)})`;
        }
      });

      const deck = deckRef.current;
      if (deck) deck.style.transform = `translateY(${lift.toFixed(2)}px)`;
    },
    [applySettled, deckRef, hostRef, risers],
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

    /* Read while the heading is at full height — sync() stamps data-stack-ready
       before calling measure(), so the CSS that collapses it is already off. */
    const heading = headingRef.current;
    headReserveRef.current = heading
      ? heading.offsetHeight +
        (parseFloat(getComputedStyle(heading).marginBottom) || 0)
      : 0;

    measuredRef.current = true;
    // applySettled owns the base styles the strip above cleared, so it is what
    // puts them back — including the transition the measurement suppressed
    if (settledRef.current) cards.forEach(restCard);
    else applySettled(false);
    paint(lastSRef.current);
  }, [
    findGrid,
    blockerRef,
    deckRef,
    headingRef,
    stripCard,
    restCard,
    applySettled,
    paint,
  ]);

  /**
   * The deck lifts as one on hover/focus — not per-card, since it reads as one
   * stack of case studies, not four separately-hoverable tiles. The cascade
   * runs front-to-back either way: the front card leads and each layer behind
   * follows a beat later, same order lifting up and dropping back down.
   */
  const applyLift = useCallback(() => {
    const want =
      hoverRef.current &&
      !scrollingRef.current &&
      !settledRef.current &&
      !staticRef.current;
    if (liftedRef.current === want) return;
    liftedRef.current = want;

    {
      const cards = cardsRef.current;
      cards.forEach((card, i) => {
        // the nested cards never move, so they are never given a transition
        card.style.transition =
          i < TIERS
            ? `transform ${LIFT_DUR}ms ease ${i * LIFT_STAGGER}ms`
            : NO_TRANSITION;
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
        LIFT_DUR + (Math.min(cards.length, TIERS) - 1) * LIFT_STAGGER + 60,
      );
    }
  }, [deckRef, paint]);
  applyLiftRef.current = applyLift;

  const setLift = useCallback(
    (v: boolean) => {
      hoverRef.current = v;
      applyLift();
    },
    [applyLift],
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
      /* the reveal is inline, so handing over to the static layout has to give
         the rows back explicitly or they stay hidden at their offset */
      shownRef.current = true;
      risers().forEach((el) => {
        el.style.transition = "";
        show(el);
      });
      if (headingRef.current) headingRef.current.style.opacity = "";
      if (hostRef.current) {
        hostRef.current.style.transform = "";
        hostRef.current.style.removeProperty("--deck-depth");
        hostRef.current.style.removeProperty("--deck-nested");
      }
      measuredRef.current = false;
      settledRef.current = true;
      setSettled(true);
      return;
    }

    // coming back from static, the cards were handed to the grid and marked
    // settled — the deck has to be built again before paint can drive it
    if (wasOff) settledRef.current = false;
    measure();
  }, [measure, restCard, risers, hostRef, headingRef]);

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
