"use client";

import useLenisScroll from "@/hooks/use-lenis-scroll";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const NavigationEvents = () => {
  const pathname = usePathname();
  const { scrollToSectionId } = useLenisScroll();

  const [isMounted, setIsMounted] = useState(false);

  const scrollToSectionIdCB = useCallback(
    (id: string) => scrollToSectionId(id),
    [scrollToSectionId]
  );

  useEffect(() => {
    setIsMounted(true);

    return () => {
      setIsMounted(false);
    };
  }, [pathname]);

  useEffect(() => {
    const hash = window.location.hash;

    if (!isMounted) {
      return;
    }

    if (hash) {
      setTimeout(() => {
        scrollToSectionIdCB(hash.replace("#", ""));
      }, 700);
    }
  }, [isMounted, pathname, scrollToSectionIdCB]);

  return null;
};

export default NavigationEvents;
