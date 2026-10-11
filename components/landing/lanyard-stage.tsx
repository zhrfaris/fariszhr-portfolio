"use client";

import { RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

import { cardAspect, LanyardSettings } from "@/lib/lanyard-settings";
import styles from "./landing.module.css";

// three.js and the scene only download after the page is interactive; the
// static band + card in the slot cover for it until then.
const Lanyard = dynamic(() => import("./lanyard"), {
  ssr: false,
  loading: () => null,
});

interface Frame {
  left: number;
  width: number;
  height: number;
  anchorX: number;
  cardTop: number;
  size: number;
}

/**
 * Positions the lanyard canvas over the page so the resting card lands exactly
 * on the layout slot (the static card's box). The canvas spans the full width
 * of the landing root (a swinging card is never cut off at the sides) and is
 * as tall as the card can reach below its slot. Its height depends only on the
 * slot, not on how long the page below is, so switching tabs or photos loading
 * never re-frames the card. It takes no pointer events itself; the Lanyard
 * listens on window and only reacts when a press lands on the card.
 */
const LanyardStage = ({
  rootRef,
  slotRef,
  frontImage,
  backImage,
  bandImage,
  lanyard,
  flipped,
  onTap,
  onReady,
}: {
  rootRef: RefObject<HTMLDivElement>;
  slotRef: RefObject<HTMLDivElement>;
  frontImage?: string;
  backImage?: string;
  bandImage?: string;
  lanyard: LanyardSettings;
  flipped: boolean;
  onTap: () => void;
  onReady: () => void;
}) => {
  const [frame, setFrame] = useState<Frame | null>(null);
  const [mounted, setMounted] = useState(false);
  const measureRef = useRef<() => void>(() => {});
  const pathname = usePathname();

  useEffect(() => {
    const root = rootRef.current;
    const slot = slotRef.current;
    if (!root || !slot) return;

    const measure = () => {
      const r = root.getBoundingClientRect();
      const s = slot.getBoundingClientRect();
      if (!s.width || !s.height) return;
      if (!r.width || !r.height) return;
      const centerX = s.left - r.left + s.width / 2;
      const top = s.top - r.top;
      const left = 0;
      const width = r.width;
      const height = Math.ceil(top + s.height * 2.6);
      setFrame((prev) => {
        const next = {
          left,
          width,
          height,
          anchorX: centerX / width,
          cardTop: top / height,
          size: s.height / height,
        };
        return prev &&
          (Object.keys(next) as (keyof Frame)[]).every(
            (k) => Math.abs(prev[k] - next[k]) < 1e-4
          )
          ? prev
          : next;
      });
    };

    measureRef.current = measure;
    measure();
    // The slot itself, and the grid holding the intro above it (its row moves
    // when the intro wraps differently). Content changes further down land
    // here too, but they don't move the slot, so the frame stays identical.
    const observer = new ResizeObserver(measure);
    observer.observe(slot);
    if (root.firstElementChild) observer.observe(root.firstElementChild);
    // The root only matters for its width: ignore height-only changes (the
    // page growing as photos load or the other tab's content swaps in).
    let rootWidth = root.getBoundingClientRect().width;
    const widthObserver = new ResizeObserver(() => {
      const w = root.getBoundingClientRect().width;
      if (w === rootWidth) return;
      rootWidth = w;
      measure();
    });
    widthObserver.observe(root);
    // Resize observations pause while the tab is hidden; catch up on return.
    const onVisible = () => !document.hidden && measure();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      observer.disconnect();
      widthObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [rootRef, slotRef]);

  // A route switch swaps the intro, which moves the card's row even when the
  // page's overall size happens not to change.
  useLayoutEffect(() => {
    measureRef.current();
  }, [pathname]);

  // Wait for an idle moment after hydration before pulling in three.js.
  useEffect(() => {
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => setMounted(true), {
        timeout: 1500,
      });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(() => setMounted(true), 300);
    return () => clearTimeout(id);
  }, []);

  if (!frame || !mounted) return null;

  return (
    <div
      className={styles.stage}
      style={{ left: frame.left, width: frame.width, height: frame.height }}
    >
      <Lanyard
        frontImage={frontImage}
        backImage={backImage}
        // Size, anchor and resting spot come from the measured slot (which
        // the shell already sized and nudged from the same settings).
        aspectRatio={cardAspect(lanyard.orientation)}
        anchorX={frame.anchorX}
        cardTop={frame.cardTop}
        size={frame.size}
        imageFit={lanyard.imageFit}
        finish={lanyard.finish}
        metal={lanyard.metal}
        cardColor={lanyard.cardColor}
        cornerRadius={lanyard.cornerRadius}
        strapLength={lanyard.bandLength}
        strapImage={bandImage}
        strapColor={lanyard.bandColor}
        strapWidth={lanyard.bandWidth}
        gravity={lanyard.gravity}
        damping={lanyard.damping}
        elasticity={lanyard.elasticity}
        breeze={lanyard.breeze}
        interactive={lanyard.interactive}
        entrance={lanyard.entrance}
        flipped={flipped}
        onTap={onTap}
        onReady={onReady}
      />
    </div>
  );
};

export default LanyardStage;
