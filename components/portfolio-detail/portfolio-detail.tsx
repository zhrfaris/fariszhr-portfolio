"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { Button } from "../shadcn/button";
import useLenisScroll from "@/hooks/use-lenis-scroll";
import { ArrowUp } from "lucide-react";
import PortfolioSection from "./portfolio-section";
import { PostSection } from "@/actions/post/create/types";

interface PortfolioDetailProps {
  sections: PostSection[];
}

const PortfolioDetail = ({ sections }: PortfolioDetailProps) => {
  const { scrollToTop } = useLenisScroll();

  return (
    <div className="min-h-screen relative">
      <Button
        size="icon"
        className="fixed bottom-4 right-4 rounded-full bg-white text-foreground hover:bg-zinc-300 shadow-md"
        onClick={() => scrollToTop()}
      >
        <ArrowUp />
      </Button>
      <div className="h-[50vh] max-h-[500px] bg-[#f5f5f5]"></div>
      <div className="p-4">
        <div className="max-w-screen-md mx-auto space-y-8 pb-12">
          {/* Portfolio Title Header */}
          <div className="portfolio-title-header flex items-center gap-4">
            <div className="w-40 h-8 rounded-xl bg-[#3251a5]"></div>
            <h4>On Demand Service - Mobile App</h4>
          </div>

          {/* Portfolio Title */}
          <h2 className={cn("text-5xl font-bold pb-6")}>
            Add Service Duration During On-going Order
          </h2>

          {/* Portfolio Sections */}
          {sections.map((section) => (
            <PortfolioSection key={section.id} section={section} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioDetail;
