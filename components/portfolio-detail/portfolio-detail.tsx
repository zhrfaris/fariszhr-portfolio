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
import {
  COVER_IMAGE,
  COVER_INNER,
  COVER_WRAPPER_BASE,
  DETAIL_COLUMN,
  DETAIL_TITLE,
  CATEGORY_ROW_TEXT,
  TITLE_HEADER_ROW,
  WORKPLACE_LOGO,
} from "./portfolio-styles";

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
      <div className={cn(COVER_WRAPPER_BASE, "flex flex-col justify-end")}>
        <div className={COVER_INNER}>
          <Image
            alt=""
            src={post.header_image.img_url}
            fill
            className={COVER_IMAGE}
          />
        </div>
      </div>

      <div className="px-6 pb-24">
        <div className={DETAIL_COLUMN}>
          {/* Portfolio Title Header */}
          <div className={TITLE_HEADER_ROW}>
            {post?.workplace && (
              <Image
                src={post.workplace.image.img_url}
                alt=""
                width={post.workplace.image.img_width}
                height={post.workplace.image.img_height}
                className={WORKPLACE_LOGO}
              />
            )}
            <h4 className={CATEGORY_ROW_TEXT}>
              {post.categories.map((category) => category.name).join(" - ")}
            </h4>
          </div>

          {/* Portfolio Title */}
          <h2 className={DETAIL_TITLE}>{post.title}</h2>

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
