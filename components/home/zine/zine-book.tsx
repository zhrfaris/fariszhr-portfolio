"use client";

import Image from "next/image";
import { forwardRef, useRef, type KeyboardEvent } from "react";

import MainButton from "@/components/common/main-button";
import styles from "./zine.module.css";
import { ZINE_PAGES, zineContent } from "@/content/home";
import { sheetInset, stageInset } from "./page-metrics";
import { useZineRenderer } from "./use-zine-renderer";

/**
 * The book frame. The paper itself is a plain element, so the spread is a
 * sized, laid-out box before — or without — WebGL; the renderer paints over it
 * and takes the interaction from there.
 */
const ZineBook = forwardRef<HTMLDivElement>(function ZineBook(_props, ref) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { spread, spreadCount, supported, canTurnBack, canTurnForward, turn } =
    useZineRenderer({ stageRef, canvasRef });

  const onKeyDown = (ev: KeyboardEvent<HTMLDivElement>) => {
    if (ev.key === "ArrowRight" && canTurnForward) {
      ev.preventDefault();
      turn(1);
    }
    if (ev.key === "ArrowLeft" && canTurnBack) {
      ev.preventDefault();
      turn(-1);
    }
  };

  return (
    /* The key handler lives on the wrapper so it catches arrows from whatever
       inside has focus — the canvas or either nav button. */
    <div className={styles.zine} ref={ref} onKeyDown={onKeyDown}>
      <div className={styles.stage} ref={stageRef} style={stageInset}>
        <div className={styles.sheet} style={{ inset: sheetInset }}>
          {/* Without WebGL the spread is still readable — just not turnable by hand. */}
          {supported === false && (
            <div className={styles.fallback}>
              {[spread * 2, spread * 2 + 1].map((i) =>
                ZINE_PAGES[i] ? (
                  <Image
                    key={i}
                    src={ZINE_PAGES[i]}
                    alt=""
                    width={1440}
                    height={1920}
                    priority={i < 2}
                  />
                ) : null,
              )}
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
        <MainButton
          rounded
          size="icon"
          type="button"
          className={`${styles.nav} ${styles.prev}`}
          aria-label={zineContent.prevLabel}
          disabled={!canTurnBack}
          onClick={() => turn(-1)}
        >
          &lsaquo;
        </MainButton>
        <MainButton
          rounded
          size="icon"
          type="button"
          className={`${styles.nav} ${styles.next}`}
          aria-label={zineContent.nextLabel}
          disabled={!canTurnForward}
          onClick={() => turn(1)}
        >
          &rsaquo;
        </MainButton>

        {/* Count comes from the renderer, so the dots can never drift from the turns. */}
        <div className={styles.meter} aria-hidden>
          {Array.from({ length: spreadCount }, (_, i) => (
            <i key={i} className={i === spread ? styles.on : undefined} />
          ))}
        </div>
      </div>
    </div>
  );
});

export default ZineBook;
