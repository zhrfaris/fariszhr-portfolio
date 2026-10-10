"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { PostSection } from "@/actions/post/create/types";
import SanitizedHtml from "../common/sanitized-html";
import Image from "next/image";
import { Button, buttonVariants } from "../shadcn/button";
import Link from "next/link";
import { Maximize } from "lucide-react";
import {
  getRadiusPx,
  parseSectionHtml,
  ParsedInlineImage,
} from "@/lib/section-content";
import {
  SECTION_BODY,
  SECTION_RICHTEXT,
  SECTION_TITLE,
} from "./portfolio-styles";

interface PortfolioSectionProps {
  section: PostSection;
  showFull?: boolean;
}

const InlineImage = ({ image }: { image: ParsedInlineImage }) => {
  const hasBlur = image.placeholder?.startsWith("data:");

  return (
    <div
      className="w-full min-h-12 border border-[#d9d9d9] overflow-hidden relative"
      style={{ borderRadius: getRadiusPx(image.radius) }}
    >
      <Image
        src={image.src}
        placeholder={hasBlur ? "blur" : "empty"}
        blurDataURL={hasBlur ? image.placeholder : undefined}
        alt=""
        width={image.width ?? 1200}
        height={image.height ?? 800}
        className="w-full object-contain"
      />
      <Link
        className={buttonVariants({
          size: "icon",
          variant: "outline",
          className: "absolute bottom-4 right-4",
        })}
        href={image.src}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Maximize />
      </Link>
    </div>
  );
};

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
          "section space-y-6 pb-6",
          isShowMore ? "max-h-none" : "max-h-[400px] overflow-hidden"
        )}
      >
        {section.title?.trim() && (
          <h3 className={SECTION_TITLE}>{section.title}</h3>
        )}
        <div className={SECTION_BODY}>
          {section.contents.map((content) => (
            <SectionContent key={content.id} content={content} />
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

const SectionContent = ({
  content,
}: {
  content: PostSection["contents"][number];
}) => {
  const segments = useMemo(
    () => parseSectionHtml(content.content),
    [content.content]
  );

  return (
    <div className="space-y-4">
      {segments.map((segment, index) =>
        segment.type === "image" ? (
          <InlineImage key={index} image={segment.image} />
        ) : (
          <SanitizedHtml
            key={index}
            innerHTML={segment.html}
            className={SECTION_RICHTEXT}
          />
        )
      )}

      {/* Legacy: separate image on posts not yet re-saved in the block editor */}
      {content.image && (
        <InlineImage
          image={{
            src: content.image.img_url,
            placeholder: content.image.img_url_placeholder,
            width: content.image.img_width,
            height: content.image.img_height,
            radius: content.content_image_radius ?? "XXL",
            publicId: content.image.public_id,
          }}
        />
      )}
    </div>
  );
};

export default PortfolioSection;
