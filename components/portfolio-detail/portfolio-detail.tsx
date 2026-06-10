"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { buttonVariants } from "../shadcn/button";
import useLenisScroll from "@/hooks/use-lenis-scroll";
import { ArrowUp, Pen } from "lucide-react";
import PortfolioSection from "./portfolio-section";
import { Portfolio } from "@/actions/post/get/types";

import Image from "next/image";
import Link from "next/link";

interface PortfolioDetailProps {
  post: NonNullable<Portfolio>;
  showEditButton?: boolean;
}

const PortfolioDetail = ({ post, showEditButton }: PortfolioDetailProps) => {
  const { scrollToTop } = useLenisScroll();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!endRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowBackToTop(entry.isIntersecting),
      { threshold: 0 },
    );

    observer.observe(endRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen relative">
      {showEditButton && (
        <Link
          href={`/dashboard/posts/${post.slug}/edit`}
          className={buttonVariants({
            className:
              "hidden md:flex absolute z-40 top-20 right-8 rounded-full shadow-md",
          })}
        >
          <Pen />
          <span>Edit Post</span>
        </Link>
      )}
      <div className="h-[180px] md:h-[50vh] max-h-[500px] bg-[#f5f5f5] relative flex flex-col justify-end">
        <div className="size-full relative max-w-[1800px] mx-auto">
          <Image
            alt=""
            src={post.header_image.img_url}
            fill
            placeholder="blur"
            blurDataURL={post.header_image.img_url_placeholder}
            className="size-full object-contain object-bottom md:object-cover"
          />
        </div>
      </div>

      <div className="px-6 pb-24">
        <div className="max-w-screen-md mx-auto space-y-8 py-6 md:py-12">
          {/* Portfolio Title Header */}
          <div className="portfolio-title-header flex items-center gap-4">
            {post?.workplace && (
              <Image
                src={post.workplace.image.img_url}
                alt=""
                width={post.workplace.image.img_width}
                height={post.workplace.image.img_height}
                className="max-w-24 md:max-w-40 h-fit object-contain"
              />
            )}
            <h4 className="text-xs md:text-base">
              {post.categories.map((category) => category.name).join(" - ")}
            </h4>
          </div>

          {/* Portfolio Title */}
          <h2
            className={cn(
              "text-3xl md:text-5xl font-bold md:!leading-[3.75rem]",
            )}
          >
            {post.title}
          </h2>

          {/* Portfolio Sections */}
          {post?.post_sections.map((section) => (
            <PortfolioSection
              key={section.id}
              section={section}
              showFull={true}
            />
          ))}
        </div>
      </div>

      {/* Sentinel for detecting end of page */}
      <div ref={endRef} className="h-px" />

      {/* Back to top */}
      <div
        className={cn(
          "fixed bottom-8 left-1/2 -translate-x-1/2 z-40 transition-all duration-300",
          showBackToTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none",
        )}
      >
        <button
          onClick={() => scrollToTop()}
          className="back-to-top-btn bg-gradient-to-b from-[#626262] to-[#3a3a3a] p-[3px] rounded-full h-fit"
        >
          <span className="flex items-center justify-center gap-2 bg-gradient-to-b from-[#353535] to-[#666666] text-white rounded-full h-10 py-2 px-5 shadow-[0_0.9px_3.6px_0.9px_rgba(0,0,0,0.12),0_2.7px_2.92px_-1.35px_rgba(0,0,0,0.25),0_0px_0.22px_0.67px_rgba(0,0,0,0.05),0_0px_0.22px_0.22px_rgba(0,0,0,0.07)]">
            <ArrowUp className="size-4" />
            <span className="text-sm">Back to the top</span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default PortfolioDetail;
