"use client";

import { useEffect, useRef } from "react";

/**
 * The case studies' entrance on "/", the same as Photo works' photos
 * (landing.module.css): each card comes in once its thumbnail has loaded —
 * at once if it has none, or it fails — staggered by its index. Renders the
 * same wrapper CaseGrid had, so nothing about the layout changes.
 */
const CaseEntrance = ({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = ref.current?.querySelectorAll<HTMLElement>("[data-case-grid] > *");
    const undo: (() => void)[] = [];
    cards?.forEach((card, index) => {
      card.style.setProperty("--i", String(index));
      const show = () => card.setAttribute("data-shown", "");
      const img = card.querySelector("img");
      if (!img || (img.complete && img.naturalWidth > 0)) return show();
      img.addEventListener("load", show, { once: true });
      img.addEventListener("error", show, { once: true });
      undo.push(() => {
        img.removeEventListener("load", show);
        img.removeEventListener("error", show);
      });
    });
    return () => undo.forEach((u) => u());
  }, []);

  return (
    <div className={className} ref={ref}>
      {children}
    </div>
  );
};

export default CaseEntrance;
