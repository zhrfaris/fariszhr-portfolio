"use client";

import Image from "next/image";
import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MutableRefObject,
} from "react";

import MainButton from "@/components/common/main-button";
import styles from "./zine.module.css";
import { ZINE_PAGES, zineContent } from "@/content/home";
import { sheetInset, stageInset } from "./page-metrics";
import type { PageSource } from "./page-textures";
import { useZineRenderer } from "./use-zine-renderer";

export interface ZineBookProps {
  /** Page faces; defaults to the home zine's artwork. */
  pages?: PageSource[];
  /** Turn off either end onto the other (default) or stop at the ends. */
  loop?: boolean;
  /** Spread to open on. */
  initialSpread?: number;
  /** The idle corner-lift hint (default on). */
  nudge?: boolean;
  /** The arrows beside the book (default on). */
  showNav?: boolean;
  /** Extra class on the book, e.g. to size it for another layout. */
  className?: string;
  /** Called with the open spread whenever a turn settles. */
  onSpreadChange?: (spread: number) => void;
  /** Receives the book's animated turn, for controls outside it. */
  turnRef?: MutableRefObject<((dir: 1 | -1) => void) | null>;
  /** Called once the open spread is on screen with its artwork. */
  onReady?: () => void;
  /** Hold the drawing once the open spread is on screen (a hidden book). */
  paused?: boolean;
  /** Receives a jump straight to a spread (no turn), for a host that keeps
   * the book in step with something else. */
  jumpRef?: MutableRefObject<((spread: number) => void) | null>;
}

/**
 * The book frame. The paper itself is a plain element, so the spread is a
 * sized, laid-out box before — or without — WebGL; the renderer paints over it
 * and takes the interaction from there.
 */
const ZineBook = forwardRef<HTMLDivElement, ZineBookProps>(function ZineBook(
  {
    pages,
    loop = true,
    initialSpread = 0,
    nudge = true,
    showNav = true,
    className,
    onSpreadChange,
    turnRef,
    onReady,
    paused,
    jumpRef,
  },
  ref,
) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const { spread, spreadCount, supported, turn, jump } = useZineRenderer({
    stageRef,
    canvasRef,
    sheetRef,
    pages,
    loop,
    initialSpread,
    nudge,
    onReady,
    paused,
  });

  const onSpreadChangeRef = useRef(onSpreadChange);
  onSpreadChangeRef.current = onSpreadChange;
  useEffect(() => {
    onSpreadChangeRef.current?.(spread);
  }, [spread]);

  useEffect(() => {
    if (!turnRef) return;
    turnRef.current = turn;
    return () => {
      turnRef.current = null;
    };
  }, [turnRef, turn]);

  useEffect(() => {
    if (!jumpRef) return;
    jumpRef.current = jump;
    return () => {
      jumpRef.current = null;
    };
  }, [jumpRef, jump]);

  const faces = pages ?? ZINE_PAGES;

  /* Both directions always turn: the book loops, so there is no end to stop at. */
  const onKeyDown = (ev: KeyboardEvent<HTMLDivElement>) => {
    if (ev.key === "ArrowRight") {
      ev.preventDefault();
      turn(1);
    }
    if (ev.key === "ArrowLeft") {
      ev.preventDefault();
      turn(-1);
    }
  };

  return (
    /* The key handler lives on the wrapper so it catches arrows from whatever
       inside has focus — the canvas or either nav button. */
    <div
      className={className ? `${styles.zine} ${className}` : styles.zine}
      ref={ref}
      onKeyDown={onKeyDown}
    >
      {/* data-zine-stage: the transparent room around the paper, so a host
          (the photo viewer) can treat a press there as its background */}
      <div className={styles.stage} ref={stageRef} style={stageInset} data-zine-stage="">
        <div className={styles.sheet} ref={sheetRef} style={{ inset: sheetInset }}>
          {/* Without WebGL the spread is still readable — just not turnable by hand. */}
          {supported === false && (
            <div className={styles.fallback}>
              {[spread * 2, spread * 2 + 1].map((i) => {
                const face = faces[i];
                if (!face) return null;
                return typeof face === "string" ? (
                  <Image
                    key={i}
                    src={face}
                    alt=""
                    width={1440}
                    height={1920}
                    priority={i < 2}
                  />
                ) : (
                  <ComposedFace key={i} source={face} />
                );
              })}
            </div>
          )}
        </div>

        {/* the canvas is the thing a reader actually grabs, so it is the thing
            that takes focus — the stage behind it can never be reached */}
        <canvas
          className={styles.canvas}
          ref={canvasRef}
          hidden={supported === false}
          tabIndex={supported === false ? -1 : 0}
          role="group"
          aria-roledescription="zine"
          aria-label={`Zine — spread ${spread + 1} of ${spreadCount}. Drag a page, or use the arrow keys, to turn it.`}
        />

        {/* The ring-and-circle surface is MainButton — the same component the
            site CTA uses — so the treatment has one definition, not two. The
            button element is the ring and carries the handlers; the inner
            circle it renders is presentational and holds the chevron. */}
        {showNav && (
          <>
            <MainButton
              rounded
              size="icon"
              type="button"
              className={`${styles.nav} ${styles.prev}`}
              aria-label={zineContent.prevLabel}
              onClick={() => turn(-1)}
            >
              <span className={`${styles.navIcon} ${styles.navIconPrev}`} aria-hidden />
            </MainButton>
            <MainButton
              rounded
              size="icon"
              type="button"
              className={`${styles.nav} ${styles.next}`}
              aria-label={zineContent.nextLabel}
              onClick={() => turn(1)}
            >
              <span className={`${styles.navIcon} ${styles.navIconNext}`} aria-hidden />
            </MainButton>
          </>
        )}
      </div>
    </div>
  );
});

/** A composed page face for the no-WebGL fallback. */
const ComposedFace = ({ source }: { source: () => Promise<HTMLCanvasElement> }) => {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    source()
      .then((canvas) => alive && setSrc(canvas.toDataURL("image/jpeg", 0.9)))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [source]);
  // eslint-disable-next-line @next/next/no-img-element
  return src ? <img src={src} alt="" /> : <span />;
};

export default ZineBook;
