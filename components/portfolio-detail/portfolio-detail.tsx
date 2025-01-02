"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { Button, buttonVariants } from "../shadcn/button";
import useLenisScroll from "@/hooks/use-lenis-scroll";
import { ArrowUp, Pen } from "lucide-react";
import PortfolioSection from "./portfolio-section";
import { Post } from "@/actions/post/get/types";
import Image from "next/image";
import Link from "next/link";

interface PortfolioDetailProps {
  post: NonNullable<Post>;
  showEditButton?: boolean;
}

const PortfolioDetail = ({ post, showEditButton }: PortfolioDetailProps) => {
  const { scrollToTop } = useLenisScroll();

  return (
    <div className="min-h-screen relative">
      {showEditButton && (
        <Link
          href={`/dashboard/posts/${post.slug}/edit`}
          className={buttonVariants({
            className: "absolute z-40 top-20 right-8 rounded-full shadow-md",
          })}
        >
          <Pen />
          <span>Edit Post</span>
        </Link>
      )}
      <Button
        size="icon"
        className="fixed bottom-4 right-4 rounded-full bg-white text-foreground hover:bg-zinc-300 shadow-md"
        onClick={() => scrollToTop()}
      >
        <ArrowUp />
      </Button>
      <div className="h-[50vh] max-h-[500px] bg-[#f5f5f5] relative flex flex-col justify-end">
        <div className="size-full relative max-w-[1800px] mx-auto">
          <Image
            alt=""
            src={post.header_image.img_url}
            fill
            placeholder="blur"
            blurDataURL={post.header_image.img_url_placeholder}
            className="size-full object-cover"
          />
        </div>
      </div>
      <div className="p-4">
        <div className="max-w-screen-md mx-auto space-y-8 py-12">
          {/* Portfolio Title Header */}
          <div className="portfolio-title-header flex items-center gap-4">
            {post?.workplace && (
              <Image
                src={post.workplace.image.img_url}
                alt=""
                width={post.workplace.image.img_width}
                height={post.workplace.image.img_height}
                className="max-w-40 h-fit object-contain"
              />
            )}
            <h4>
              {post.categories.map((category) => category.name).join(" - ")}
            </h4>
          </div>

          {/* Portfolio Title */}
          <h2 className={cn("text-5xl font-bold pb-6")}>{post.title}</h2>

          {/* Portfolio Sections */}
          {post.post_sections.map((section) => (
            <PortfolioSection
              key={section.id}
              section={section}
              showFull={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioDetail;
