"use client";

import React, { useEffect, useRef, useState } from "react";
import { source_serif_pro } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { PostSection } from "@/actions/post/create/types";
import SanitizedHtml from "../common/sanitized-html";
import { SectionIcon } from "../form/form-select-icon";
import { iconTypeChecker } from "@/lib/icons";
import Image from "next/image";
import { Button, buttonVariants } from "../shadcn/button";
import Link from "next/link";
import { Maximize } from "lucide-react";

interface PortfolioSectionProps {
  section: PostSection;
  showFull?: boolean;
}

const PortfolioSection = ({ section, showFull }: PortfolioSectionProps) => {
  const [isShowMore, setIsShowMore] = useState(true);
  const [showShowMoreButton, setShowShowMoreButton] = useState(false);
  const sectionItemRef = useRef<HTMLDivElement>(null);

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
          "section space-y-4 pb-6 border-b",
          isShowMore ? "max-h-none" : "max-h-[400px] overflow-hidden"
        )}
      >
        <div className="section-title flex items-center gap-4">
          <SectionIcon
            size={38}
            iconId={iconTypeChecker(section.icon_type)}
            alt={`icon of ${section.icon_type}`}
          />
          <h3 className={cn(source_serif_pro.className, "text-xl font-bold")}>
            {section.title}
          </h3>
        </div>
        <div className="space-y-6">
          {section.contents.map((content) => (
            <div key={content.id} className="space-y-6">
              <SanitizedHtml innerHTML={content.content} />
              {/* add image here */}
              {content.image && (
                <div className="w-full min-h-12 rounded-2xl overflow-hidden relative">
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
