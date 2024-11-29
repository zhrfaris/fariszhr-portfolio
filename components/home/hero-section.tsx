"use client";

import { source_serif_pro } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Button } from "../shadcn/button";
import useLenisScroll from "@/hooks/use-lenis-scroll";

const HeroSection = () => {
  const { scrollToSectionId } = useLenisScroll();

  const scrollToShowcase = () => scrollToSectionId("showcase");

  return (
    <div className="p-4 space-y-4 text-center flex flex-col items-center justify-center min-h-screen">
      <div className="flex flex-col  items-center justify-center flex-1 gap-8">
        <div className="profile-pict size-[120px] rounded-full bg-zinc-300"></div>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Muhammad Faris Azhar</h1>
          <p>Product Designer</p>
        </div>
        <h2
          className={cn(
            source_serif_pro.className,
            "text-6xl font-semibold max-w-screen-md"
          )}
        >
          Humanizing technology through design
        </h2>
        <div className="pt-8">
          <Button onClick={scrollToShowcase}>See Works & Experience</Button>
        </div>
      </div>
      <div className="min-h-[100px] w-full flex flex-col items-center justify-center gap-6 py-12">
        <h4>The Company I&apos;ve been collaborated with</h4>
        <div className="flex items-center gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-lg bg-zinc-300 w-[150px]"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
