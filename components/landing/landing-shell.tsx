"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import {
  anchorShift,
  cardAspect,
  LanyardSettings,
  sizeScale,
} from "@/lib/lanyard-settings";
import styles from "./landing.module.css";
import LanyardStage from "./lanyard-stage";
import ModeTabs from "./mode-tabs";
import { PhotoWorksIcon, ProductDesignIcon } from "./mode-icons";

export type LandingMode = "product" | "photo";

export interface CardFace {
  url: string;
}

const HREF: Record<LandingMode, string> = {
  product: "/",
  photo: "/photography",
};

const modeOf = (pathname: string): LandingMode =>
  pathname.startsWith("/photography") ? "photo" : "product";

/**
 * Persistent frame for / and /photography (it lives in the route group's
 * layout, so the lanyard keeps its physics across the switch). Owns the one
 * piece of state both switchers read: `mode`.
 *
 * - Tab or card tap → `switchTo`: set mode now (tabs + card flip instantly),
 *   then navigate. The route catching up later is a no-op.
 * - Back/forward → the pathname changes without a `switchTo`, so mode follows
 *   the URL.
 * - `pending` holds the last URL we navigated to. Pathname updates from an
 *   older navigation that a quick second tap superseded are ignored, so a
 *   double tap can't flip the card back and forth twice.
 */
const LandingShell = ({
  front,
  back,
  bandImage,
  lanyard,
  footer,
  children,
}: {
  front: CardFace | null;
  back: CardFace | null;
  bandImage?: string;
  lanyard: LanyardSettings;
  footer: React.ReactNode;
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [mode, setMode] = useState<LandingMode>(() => modeOf(pathname));
  const [ready, setReady] = useState(false);
  const pending = useRef<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pending.current) {
      if (pathname !== pending.current) return;
      pending.current = null;
    }
    setMode(modeOf(pathname));
  }, [pathname]);

  useEffect(() => {
    const onPop = () => {
      pending.current = null;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    router.prefetch(HREF.product);
    router.prefetch(HREF.photo);
  }, [router]);

  const switchTo = useCallback(
    (next: LandingMode) => {
      setMode(next);
      pending.current = HREF[next];
      router.push(HREF[next], { scroll: false });
    },
    [router]
  );

  const modeRef = useRef(mode);
  modeRef.current = mode;
  const toggle = useCallback(
    () => switchTo(modeRef.current === "product" ? "photo" : "product"),
    [switchTo]
  );

  // The card's slot (the column's width and the card's resting spot, which
  // the 3D lanyard measures) follows the same settings, through these.
  const look = {
    "--card-scale": sizeScale(lanyard.size),
    "--card-aspect": cardAspect(lanyard.orientation),
    "--anchor-shift": anchorShift(lanyard.anchor),
  } as React.CSSProperties;

  return (
    <div
      ref={rootRef}
      className={cn(styles.root, ready && styles.ready)}
      style={look}
      // Which page's content is showing (follows the route, not the tab).
      data-page={modeOf(pathname)}
    >
      <div className={styles.container}>
        {/* Empty until the 3D lanyard is ready, but always its full size,
            so nothing around it moves: the strap's run above the card and
            the card's slot (which the lanyard measures to hang the card). */}
        <div className={styles.cardCol}>
          <span className={styles.bandSpace} aria-hidden />
          <div ref={slotRef} className={styles.slot} />
        </div>

        {/* Tabs, intro, content and footer are grid items of the container
            (the page's own wrapper is display: contents), so on desktop the
            card shares the content's row and its top edge lines up with the
            first content block whatever the intro's length. */}
        <div className={styles.tabsRow}>
          {/* changeOnSelect: a click switches at once, the same path as a
              tap on the card (switchTo), with the thumb travelling alongside
              rather than holding the switch until it lands. Modified and
              middle clicks still go to the link (a new tab). */}
          <ModeTabs
            aria-label="Portfolio mode"
            changeOnSelect
            value={mode}
            onChange={switchTo}
            items={[
              {
                value: "product",
                href: HREF.product,
                label: "Product design",
                icon: <ProductDesignIcon />,
              },
              {
                value: "photo",
                href: HREF.photo,
                label: "Photo works",
                icon: <PhotoWorksIcon />,
              },
            ]}
          />
        </div>
        <div className={styles.page}>{children}</div>
        {footer}
      </div>

      <LanyardStage
        rootRef={rootRef}
        slotRef={slotRef}
        frontImage={front?.url}
        backImage={back?.url}
        bandImage={lanyard.plainBand ? undefined : bandImage}
        lanyard={lanyard}
        flipped={mode === "photo"}
        onTap={toggle}
        onReady={() => setReady(true)}
      />
    </div>
  );
};

export default LandingShell;
