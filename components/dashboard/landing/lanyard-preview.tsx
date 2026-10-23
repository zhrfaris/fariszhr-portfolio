"use client";

import { useEffect, useRef, useState } from "react";
import { Image as ImageType } from "@prisma/client";

import LanyardStage from "@/components/landing/lanyard-stage";
import { cldUrl } from "@/lib/landing";
import {
  anchorShift,
  cardAspect,
  LanyardSettings,
  sizeScale,
} from "@/lib/lanyard-settings";
import { cn } from "@/lib/utils";

/** Entrance only plays when the scene starts, so a change remounts it. */
const ENTRANCE_REMOUNT_MS = 300;

/**
 * Live preview of the landing page's hanging ID card, fed the form's unsaved
 * values. It is the landing page's own LanyardStage (and through it the same
 * 3D Lanyard), measured against a slot in this panel instead of the page's
 * card column. The Lanyard re-reads its props every render, so looks, size,
 * band and physics apply in place; only `entrance` needs a fresh scene.
 *
 * A tap on the card flips it, as on the site; here it only flips the
 * preview.
 */
const LanyardPreview = ({
  lanyard,
  front,
  back,
  bandImage,
  className,
}: {
  lanyard: LanyardSettings;
  front: ImageType | null;
  back: ImageType | null;
  bandImage: ImageType | null;
  className?: string;
}) => {
  const [flipped, setFlipped] = useState(false);
  const [ready, setReady] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);

  // Debounced, so stepping through the select doesn't restart the scene on
  // every value.
  const [entrance, setEntrance] = useState(lanyard.entrance);
  useEffect(() => {
    if (lanyard.entrance === entrance) return;
    const id = setTimeout(() => {
      setReady(false);
      setEntrance(lanyard.entrance);
    }, ENTRANCE_REMOUNT_MS);
    return () => clearTimeout(id);
  }, [lanyard.entrance, entrance]);

  // Same renditions the landing layout asks Cloudinary for.
  const face = (image: ImageType | null) =>
    image?.img_url
      ? cldUrl(image.img_url, "w_1024,c_limit,q_auto,f_auto")
      : undefined;
  const band =
    bandImage?.img_url && !lanyard.plainBand
      ? cldUrl(bandImage.img_url, "w_1600,c_limit,q_auto,f_auto")
      : undefined;

  // The slot follows the same settings as the landing page's card column.
  const look = {
    "--card-scale": sizeScale(lanyard.size),
    "--card-aspect": cardAspect(lanyard.orientation),
    "--anchor-shift": anchorShift(lanyard.anchor),
  } as React.CSSProperties;

  // The stage: the canvas is positioned in here (absolute, full width) and
  // clipped to it; isolate keeps its z-index inside the card. 420px tall
  // (360 on phones), with the card scaled so the largest size still fits.
  return (
    <div
      ref={rootRef}
      className={cn(
        "relative isolate h-[360px] overflow-hidden rounded-md border bg-white md:h-[420px]",
        className
      )}
      style={look}
    >
      {/* The card's resting spot, like the landing page's slot: the band
          runs in from the top edge, as it does from the top of the page. */}
      <div
        ref={slotRef}
        aria-hidden
        className="absolute left-1/2 top-12 aspect-[var(--card-aspect)] w-[calc(var(--preview-card)*var(--card-scale))] [--preview-card:120px] md:top-16 md:[--preview-card:150px]"
        style={{
          translate:
            "calc(-50% + var(--preview-card) * var(--card-scale) * var(--anchor-shift)) 0",
        }}
      />
      {!ready && (
        <p className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[13px] text-muted-foreground">
          Loading preview…
        </p>
      )}
      <LanyardStage
        key={entrance}
        rootRef={rootRef}
        slotRef={slotRef}
        frontImage={face(front)}
        backImage={face(back)}
        bandImage={band}
        lanyard={{ ...lanyard, entrance }}
        flipped={flipped}
        onTap={() => setFlipped((f) => !f)}
        onReady={() => setReady(true)}
      />
    </div>
  );
};

export default LanyardPreview;
