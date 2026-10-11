"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";

import styles from "./landing.module.css";

/**
 * The Product design / Photo works switcher, with the interaction of React
 * Bits' Rubber Segment (reactbits.dev/micro/rubber-segment): the active
 * "thumb" stretches toward the tab it heads for, then squashes as it lands,
 * and can be dragged across with a rubber-band edge.
 *
 * Only the interaction is taken from it. The look is ours: the skeuomorphic
 * thumb (gradient, 3px border, layered shadow) is one element that moves, and
 * a white copy of the labels clipped to the thumb's edges makes the text
 * colour follow the thumb. The tabs underneath stay plain grey links, so no
 * tab ever owns the active style (or fades it in/out).
 */

/* Rubber feel, softer than the React Bits demo (stretch 100, squash 3). */
export const RUBBER = {
  /** How far (%) the thumb reaches toward the target before it lands. */
  stretch: 50,
  /** Overshoot (px) of the trailing edge as it lands. */
  squash: 1.5,
  /** Playback speed multiplier. */
  speed: 1,
};

// From React Bits' Rubber Segment.
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
const SPRING_UI = { type: "spring" as const, duration: 0.3, bounce: 0 };
const SPRING_RELAX = { type: "spring" as const, duration: 0.16, bounce: 0 };
const DILATE = 0.19;
const HANDOFF = 0.15;
const MAX_VELOCITY = 2000;
const DEADZONE = 4;
const BAND = 0.55;

type Slot = { l: number; r: number };
type Sample = [number, number];
type Drag = {
  id: number;
  x0: number;
  live: boolean;
  offset: number;
  w: number;
  hist: Sample[];
};

export interface ModeTabItem<T extends string> {
  value: T;
  /** A link to navigate to; without it the tab is a plain button (e.g. a
   * switcher inside an overlay). */
  href?: string;
  label: string;
  icon: ReactNode;
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));
const rubber = (over: number, dim: number) =>
  (over * dim * BAND) / (dim + BAND * Math.abs(over));
const velocityOf = (hist: Sample[], now: number) => {
  const recent = hist.filter(([t]) => now - t <= 100);
  if (recent.length < 2) return 0;
  const [t0, x0] = recent[0];
  const [t1, x1] = recent[recent.length - 1];
  return t1 - t0 >= 8 ? ((x1 - x0) / (t1 - t0)) * 1000 : 0;
};
/** Whichever tab the thumb's centre is over: past halfway means the other. */
const nearestSlot = (slots: Slot[], x: number) => {
  let best = 0;
  for (let i = 1; i < slots.length; i++) {
    const mid = (s: Slot) => (s.l + s.r) / 2;
    if (Math.abs(mid(slots[i]) - x) < Math.abs(mid(slots[best]) - x)) best = i;
  }
  return best;
};

/** The label reserves its semibold width, so tabs never change size. */
const TabLabel = ({ text }: { text: string }) => (
  <span className={styles.tabLabel} data-text={text}>
    {text}
  </span>
);

function ModeTabs<T extends string>({
  items,
  value,
  onChange,
  arrowKeys = true,
  changeOnSelect = false,
  "aria-label": ariaLabel,
}: {
  items: ModeTabItem<T>[];
  /** The page's current mode. */
  value: T;
  /** Called once the thumb has landed on a new tab. */
  onChange: (value: T) => void;
  /** ←/→ switch tabs (off where the arrows mean something else, e.g. the
   * photo viewer's previous / next). */
  arrowKeys?: boolean;
  /** Report the choice as the thumb sets off, not once it lands — for a host
   * that animates its own content in step with the thumb (the photo viewer). */
  changeOnSelect?: boolean;
  "aria-label": string;
}) {
  const index = Math.max(
    0,
    items.findIndex((item) => item.value === value)
  );
  const reduce = useReducedMotion();

  const layerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLElement | null)[]>([]);
  const slots = useRef<Slot[]>([]);
  const origin = useRef(0);
  /** Where the thumb is going (or sits): may run ahead of `value`. */
  const committed = useRef(index);
  /** A move whose onChange waits for the thumb to land. */
  const pending = useRef<number | null>(null);
  const handoff = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const drag = useRef<Drag | null>(null);
  /** The click a drag release produces is ignored until this time. A flag
   * would get stuck when the release lands elsewhere (no click follows) and
   * then swallow the next real click. */
  const suppressClickUntil = useRef(0);
  const gen = useRef(0);
  const [ready, setReady] = useState(false);

  const edgeL = useMotionValue(0);
  const edgeR = useMotionValue(0);
  const layerW = useMotionValue(0);
  const thumbW = useTransform(() => Math.max(0, edgeR.get() - edgeL.get()));
  const labelClip = useTransform(
    () =>
      `inset(0 ${Math.max(0, layerW.get() - edgeR.get())}px 0 ${Math.max(0, edgeL.get())}px round 8px)`
  );

  const t = (seconds: number) => seconds / RUBBER.speed;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const valueRef = useRef(value);
  valueRef.current = value;

  const jumpTo = (i: number) => {
    const s = slots.current[i];
    if (!s) return;
    clearTimeout(handoff.current);
    gen.current += 1;
    edgeL.jump(s.l);
    edgeR.jump(s.r);
    // Cutting a move short must still report it, or the route never follows.
    if (pending.current === i) {
      pending.current = null;
      if (items[i].value !== valueRef.current) onChangeRef.current(items[i].value);
    }
  };

  const measure = () => {
    const layer = layerRef.current;
    if (!layer) return;
    const rect = layer.getBoundingClientRect();
    origin.current = rect.left;
    slots.current = items.map((_, i) => {
      const r = tabRefs.current[i]?.getBoundingClientRect();
      return r ? { l: r.left - rect.left, r: r.right - rect.left } : { l: 0, r: 0 };
    });
    layerW.set(rect.width);
    // A resize (or late font load) mid-move only updates the slots; snapping
    // here would cut the move short.
    if (pending.current === null && !drag.current) jumpTo(committed.current);
  };

  // Measure before the first paint, so a direct load of /photography shows
  // the thumb already on Photo works (no entrance animation).
  useLayoutEffect(() => {
    measure();
    setReady(true);
    const observer = new ResizeObserver(measure);
    if (layerRef.current) observer.observe(layerRef.current);
    document.fonts?.ready.then(measure);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => () => {
      clearTimeout(handoff.current);
      edgeL.stop();
      edgeR.stop();
    },
    [edgeL, edgeR]
  );

  /** Report the move once the thumb is down (if nothing replaced it since). */
  const settle = (to: number, g: number) => {
    if (gen.current !== g || pending.current !== to) return;
    pending.current = null;
    if (items[to].value !== valueRef.current) onChangeRef.current(items[to].value);
  };

  const land = (to: number, v: number | null, withSquash: boolean, notify: boolean) => {
    const b = slots.current[to];
    if (!b) return;
    const g = ++gen.current;
    const dir =
      Math.sign((b.l + b.r) / 2 - (edgeL.get() + edgeR.get()) / 2) || 1;
    const [lead, leadTo, trail, trailTo] =
      dir > 0 ? [edgeR, b.r, edgeL, b.l] : [edgeL, b.l, edgeR, b.r];
    const velocityFor = (mv: MotionValue<number>) =>
      clamp(v === null ? mv.getVelocity() : v, -MAX_VELOCITY, MAX_VELOCITY);
    const leadDone = animate(lead, leadTo, {
      ...SPRING_UI,
      duration: t(0.3),
      velocity: velocityFor(lead),
    });
    const squash = withSquash ? RUBBER.squash : 0;
    const trailDone = animate(trail, trailTo + dir * squash, {
      ...SPRING_UI,
      duration: t(0.3),
      velocity: velocityFor(trail),
    }).then(() => {
      if (squash && gen.current === g) {
        return animate(trail, trailTo, { ...SPRING_RELAX, duration: t(0.16) });
      }
    });
    if (notify) Promise.all([leadDone, trailDone]).then(() => settle(to, g));
  };

  /** Stretch toward the target, then hand off to the landing springs. */
  const travel = (from: number, to: number, notify: boolean) => {
    const a = slots.current[from];
    const b = slots.current[to];
    if (!a || !b) return;
    clearTimeout(handoff.current);
    const g = ++gen.current;
    if (reduce) {
      edgeL.jump(b.l);
      edgeR.jump(b.r);
      if (notify) settle(to, g);
      return;
    }
    const u = RUBBER.stretch / 100;
    const tween = { duration: t(DILATE), ease: EASE_OUT };
    animate(edgeL, b.l + (Math.min(a.l, b.l) - b.l) * u, tween);
    animate(edgeR, b.r + (Math.max(a.r, b.r) - b.r) * u, tween);
    handoff.current = setTimeout(
      () => land(to, null, true, notify),
      t(HANDOFF) * 1000
    );
  };

  /** A user move (click, key, drag release): the route follows on landing. */
  const select = (to: number) => {
    if (to === committed.current) return;
    const from = committed.current;
    committed.current = to;
    if (changeOnSelect) {
      pending.current = null;
      travel(from, to, false);
      onChangeRef.current(items[to].value);
      return;
    }
    pending.current = to;
    travel(from, to, true);
  };

  // The mode changed from outside (card tap, back/forward): just move there.
  useEffect(() => {
    if (drag.current || pending.current !== null) return;
    if (committed.current === index) return;
    const from = committed.current;
    committed.current = index;
    travel(from, index, false);
  });

  /* ---- drag (React Bits' handlers, on our links) ---- */

  const localX = (e: { clientX: number }) => e.clientX - origin.current;

  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (drag.current || e.button !== 0) return;
    origin.current = layerRef.current?.getBoundingClientRect().left ?? 0;
    const x = localX(e);
    if (x < edgeL.get() || x > edgeR.get()) return; // only the thumb drags
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    clearTimeout(handoff.current);
    gen.current += 1;
    pending.current = null;
    edgeL.stop();
    edgeR.stop();
    // Hold the thumb by the point that was pressed, so it follows the pointer
    // exactly even when the first move is already far past the deadzone.
    drag.current = {
      id: e.pointerId,
      x0: x,
      live: false,
      offset: x - edgeL.get(),
      w: edgeR.get() - edgeL.get(),
      hist: [[e.timeStamp, x]],
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    const x = localX(e);
    d.hist.push([e.timeStamp, x]);
    if (d.hist.length > 8) d.hist.shift();
    if (!d.live) {
      if (Math.abs(x - d.x0) < DEADZONE) return;
      d.live = true;
      layerRef.current?.parentElement?.setAttribute("data-held", "");
    }
    const width = layerW.get();
    const l = x - d.offset;
    const maxL = width - d.w;
    if (reduce) {
      const c = clamp(l, 0, maxL);
      edgeL.set(c);
      edgeR.set(c + d.w);
    } else if (l < 0) {
      edgeL.set(0);
      edgeR.set(d.w - rubber(-l, d.w));
    } else if (l > maxL) {
      edgeR.set(width);
      edgeL.set(maxL + rubber(l - maxL, d.w));
    } else {
      edgeL.set(l);
      edgeR.set(l + d.w);
    }
  };

  const endDrag = (e: React.PointerEvent<HTMLElement>, cancelled: boolean) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    drag.current = null;
    layerRef.current?.parentElement?.removeAttribute("data-held");
    if (!d.live) return; // a plain press: the click handles it
    suppressClickUntil.current = performance.now() + 350;
    const from = committed.current;
    const to = cancelled
      ? from
      : nearestSlot(slots.current, (edgeL.get() + edgeR.get()) / 2);
    const v = cancelled ? null : velocityOf(d.hist, e.timeStamp);
    committed.current = to;
    pending.current = to === index ? null : to;
    if (changeOnSelect && pending.current !== null) {
      pending.current = null;
      onChangeRef.current(items[to].value);
    }
    if (reduce) {
      jumpTo(to);
      if (pending.current !== null) settle(to, gen.current);
    } else {
      land(to, v, false, pending.current !== null);
    }
  };

  /* ---- links: click / keyboard ---- */

  const onClick = (e: React.MouseEvent<HTMLElement>, i: number) => {
    // New tab / window keeps working like any link.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    if (performance.now() < suppressClickUntil.current) {
      suppressClickUntil.current = 0;
      return;
    }
    select(i);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (!arrowKeys) return;
    const last = items.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight") next = Math.min(last, committed.current + 1);
    else if (e.key === "ArrowLeft") next = Math.max(0, committed.current - 1);
    if (next === null) return;
    e.preventDefault();
    tabRefs.current[next]?.focus();
    select(next);
  };

  return (
    <nav
      className={styles.tabs}
      aria-label={ariaLabel}
      data-ready={ready ? "" : undefined}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => endDrag(e, false)}
      onPointerCancel={(e) => endDrag(e, true)}
      onLostPointerCapture={(e) => endDrag(e, true)}
    >
      {items.map((item, i) => {
        const shared = {
          ref: (el: HTMLElement | null) => {
            tabRefs.current[i] = el;
          },
          className: styles.tab,
          onPointerDown,
          onClick: (e: React.MouseEvent<HTMLElement>) => onClick(e, i),
          onKeyDown,
        };
        const content = (
          <>
            <TabLabel text={item.label} />
            {item.icon}
          </>
        );
        return item.href ? (
          <Link
            key={item.value}
            {...shared}
            href={item.href}
            scroll={false}
            draggable={false}
            aria-current={i === index ? "page" : undefined}
          >
            {content}
          </Link>
        ) : (
          <button
            key={item.value}
            {...shared}
            type="button"
            aria-current={i === index ? "true" : undefined}
          >
            {content}
          </button>
        );
      })}

      {/* The moving thumb, then the white labels clipped to it. */}
      <div ref={layerRef} className={styles.tabsLayer} aria-hidden>
        <motion.div className={styles.thumb} style={{ x: edgeL, width: thumbW }} />
        <motion.div className={styles.thumbLabels} style={{ clipPath: labelClip }}>
          {items.map((item) => (
            <span key={item.value} className={`${styles.tab} ${styles.tabOn}`}>
              <TabLabel text={item.label} />
              {item.icon}
            </span>
          ))}
        </motion.div>
      </div>
    </nav>
  );
}

export default ModeTabs;
