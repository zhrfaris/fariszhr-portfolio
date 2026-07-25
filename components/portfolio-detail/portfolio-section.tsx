"use client";

import React, { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { PostSection } from "@/actions/post/create/types";
import SanitizedHtml from "../common/sanitized-html";
import Image from "next/image";
import { Button, buttonVariants } from "../shadcn/button";
import Link from "next/link";
import { Maximize } from "lucide-react";
import { ContentImageRadiusType } from "@/actions/post/create/schema";

interface PortfolioSectionProps {
  section: PostSection;
  showFull?: boolean;
}

const PortfolioSection = ({ section, showFull }: PortfolioSectionProps) => {
  const [isShowMore, setIsShowMore] = useState(true);
  const [showShowMoreButton, setShowShowMoreButton] = useState(false);
  const sectionItemRef = useRef<HTMLDivElement>(null);

  const getRadiusStyle = (radius: ContentImageRadiusType) => {
    let className = "";

    switch (radius) {
      case "SM":
        className = "rounded-[4px]";
        break;
      case "MD":
        className = "rounded-[6px]";
        break;
      case "LG":
        className = "rounded-[8px]";
        break;
      case "XL":
        className = "rounded-[12px]";
        break;
      case "XXL":
        className = "rounded-[16px]";
        break;
      case "XXL":
        className = "rounded-[24px]";
        break;

      default:
        className = "rounded-[16px]";
        break;
    }

    return className;
  };

  useEffect(() => {
    if (!sectionItemRef.current) return;

    const clientHeight = sectionItemRef.current.clientHeight;

    if (showFull) return;

    if (clientHeight > 400) {
      setIsShowMore(false);
      setShowShowMoreButton(true);
    }
  }, [showFull]);

  return (
    <div className="space-y-4">
      <div
        ref={sectionItemRef}
        className={cn(
          "section space-y-6 pb-6",
          isShowMore ? "max-h-none" : "max-h-[400px] overflow-hidden"
        )}
      >
        <div>
          <h3 className="text-[15px] font-normal text-foreground/80 mb-3">
            {section.title}
          </h3>
          <hr className="border-[#e5e5e5]" />
        </div>
        <div className="space-y-6 text-[15px] leading-[185%]">
          {section.contents.map((content) => (
            <div key={content.id} className="space-y-4">
              <SanitizedHtml innerHTML={content.content} />
              {/* add image here */}
              {content.image && (
                <div
                  className={cn(
                    "max-w-[85%] mx-auto min-h-12 border border-[#d9d9d9] overflow-hidden relative",
                    getRadiusStyle(content.content_image_radius ?? "XXL")
                  )}
                >
                  <Image
                    src={content.image.img_url}
                    placeholder="blur"
                    blurDataURL={content.image.img_url_placeholder}
                    alt=""
                    width={content.image.img_width}
                    height={content.image.img_height}
                    className="w-full object-contain"
                  />
                  <Link
                    className={buttonVariants({
                      size: "icon",
                      variant: "outline",
                      className: "absolute bottom-4 right-4",
                    })}
                    href={content.image.img_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Maximize />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {showShowMoreButton && (
        <Button
          onClick={() => setIsShowMore(!isShowMore)}
          variant="outline"
          className="w-full"
        >
          Show {isShowMore ? "Less" : "More"}
        </Button>
      )}
    </div>
  );
};

export default PortfolioSection;
