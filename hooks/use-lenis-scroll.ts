"use client";

import Lenis from "lenis";
import { useEffect, useRef } from "react";

const useLenisScroll = () => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis
    lenisRef.current = new Lenis();

    // Lenis scroll animation frame
    function raf(time: number) {
      lenisRef.current?.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Cleanup
    return () => {
      lenisRef.current?.destroy();
    };
  }, []);

  const scrollToSectionId = (sectionId: string) => {
    const showcaseSection = document.getElementById(sectionId);

    const easeInOutCubic = (t: number) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    if (showcaseSection && lenisRef.current) {
      // Use Lenis scroll method for smooth scrolling
      lenisRef.current.scrollTo(showcaseSection, {
        offset: 0, // Adjust if you want to offset the scroll
        duration: 1, // Adjust duration as needed
        easing: easeInOutCubic,
      });
    }
  };

  return {
    scrollToSectionId,
  };
};

export default useLenisScroll;
