"use client";

import useLenisScroll from "@/hooks/use-lenis-scroll";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";

const NavigationEvents = () => {
  const pathname = usePathname();
  const searhParams = useSearchParams();
  const { scrollToSectionId } = useLenisScroll();

  const scrollToSectionIdCB = useCallback(
    (id: string) => scrollToSectionId(id),
    [scrollToSectionId]
  );

  useEffect(() => {
    const hash = window.location.hash;

    if (hash) {
      setTimeout(() => {
        scrollToSectionIdCB(hash.replace("#", ""));
      }, 800);
    }
  }, [pathname, searhParams, scrollToSectionIdCB]);

  return null;
};

export default NavigationEvents;
