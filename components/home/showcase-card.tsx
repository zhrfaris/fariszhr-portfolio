import React from "react";

import styles from "./showcase-card.module.scss";
import { cn } from "@/lib/utils";

import Link from "next/link";
import { getImageProps } from "next/image";
import { ImageIcon } from "lucide-react";

interface ShowcaseCardProps {
  title?: string;
  description?: string;
  image_url?: string;
  /** Animated GIF played on hover (desktop only); static image shows on touch
   * devices and when not hovering. */
  gif_url?: string;
  /** 3:2 crop shown instead of `image_url` below md; falls back to it. */
  mobile_image_url?: string;
  link?: string;
  target?: "_blank";
  className?: string;
  prefetch?: boolean;
  /** Only id + name are used; full Category records are assignable. */
  categories?: { id: string; name: string }[];
  /** Render empty-state placeholders (title/description/image/4 category
   * chips) for any missing field — used by the dashboard thumbnail preview. */
  showPlaceholders?: boolean;
}

/** Tailwind's md, the gate home.module.css stacks the card on. */
const MOBILE_MEDIA = "(max-width: 767px)";
const MOBILE_SIZES = "calc(100vw - 44px)";
const BLANK_GIF =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

const ShowcaseCard = ({
  link,
  title,
  target,
  className,
  description,
  image_url,
  gif_url,
  mobile_image_url,
  prefetch,
  categories,
  showPlaceholders,
}: ShowcaseCardProps) => {
  const Wrapper = ({
    children,
    link,
    className,
    target,
  }: {
    children: React.ReactNode;
    className?: string;
    link?: string;
    target?: "_blank";
  }) => {
    if (!!link) {
      return (
        <Link
          className={className}
          href={link}
          target={target}
          rel={target === "_blank" ? "noopener noreferrer" : undefined}
          prefetch={prefetch}
        >
          {children}
        </Link>
      );
    }

    return <div className={className}>{children}</div>;
  };

  const placeholderCategories = showPlaceholders && !categories?.length;

  // One <picture>: below md the browser takes the mobile source (the card's
  // full width — container minus the 22px gutters — so ~1000px at 3x), above
  // it the same image as before. Only the matching one is downloaded.
  const imageClassName =
    "object-cover size-full md:object-contain object-left-top md:object-center";
  const desktopImage = image_url
    ? getImageProps({
        alt: "",
        src: image_url,
        fill: true,
        sizes: "100vw",
        className: imageClassName,
      }).props
    : null;
  const mobileSrcSet = image_url
    ? getImageProps({
        alt: "",
        src: mobile_image_url || image_url,
        fill: true,
        sizes: MOBILE_SIZES,
      }).props.srcSet
    : undefined;

  return (
    <Wrapper
      link={link}
      target={target}
      className={cn(
        "overflow-hidden col-span-12 md:col-span-6 group",
        styles.card,
        className,
      )}
    >
      <div className="group-hover:md:bg-[#353535] rounded-lg shadow-inner">
        <div className={cn("flex justify-between items-center ")}>
          {image_url ? (
            <div
              className={cn(
                "img size-[200px] relative rounded-[8px] overflow-hidden",
              )}
            >
              <picture>
                <source
                  media={MOBILE_MEDIA}
                  srcSet={mobileSrcSet}
                  sizes={MOBILE_SIZES}
                />
                {/* eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element */}
                <img {...desktopImage} />
              </picture>
              {gif_url && (
                // Plain <img> (not next/image) so the animated GIF plays
                // untouched. Fades in on hover, desktop only — below md the
                // source swaps in a 1px blank so the GIF is never fetched.
                <picture>
                  <source media={MOBILE_MEDIA} srcSet={BLANK_GIF} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt=""
                    src={gif_url}
                    className="absolute inset-0 size-full object-cover object-left-top md:object-center opacity-0 transition-opacity duration-200 [@media(hover:hover)]:group-hover:opacity-100 pointer-events-none"
                  />
                </picture>
              )}
              <div className="img_overlay absolute inset-x-0 bottom-0 w-full h-[40px] bg-gradient-to-t from-[#f5f5f5] to-transparent z-10 group-hover:md:from-[#353535]" />
            </div>
          ) : (
            showPlaceholders && (
              <div className="img size-[200px] shrink-0 rounded-[8px] flex items-center justify-center">
                <ImageIcon className="size-10 text-muted-foreground/40" />
              </div>
            )
          )}
          <div className="text flex-1 text-left pl-2 pr-4">
            {title ? (
              <h3 className="text-sm font-semibold mb-1 leading-[22px] tracking-[-0.2px] group-hover:md:text-[#ffffff]">
                {title}
              </h3>
            ) : (
              showPlaceholders && (
                <h3 className="text-sm font-semibold mb-1 leading-[22px] tracking-[-0.2px] text-foreground/40 group-hover:md:text-white/60">
                  Title should be here
                </h3>
              )
            )}
            {description ? (
              <p className="text-[13px] leading-[23px] tracking-[0.5px] text-[#545A5F] group-hover:md:text-[#ffffff]">
                {description}
              </p>
            ) : (
              showPlaceholders && (
                <p className="text-[13px] leading-[23px] tracking-[0.5px] text-foreground/40 group-hover:md:text-white/60">
                  Short description should be here
                </p>
              )
            )}
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 py-0.5 px-3">
          {placeholderCategories
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white group-hover:md:bg-[#444444] border border-[#eeeeee] group-hover:md:border-[#EEEEEE1A] rounded-full py-1 px-2"
                >
                  <p className="text-muted-foreground/50 text-xs group-hover:md:text-white/60">
                    Category
                  </p>
                </div>
              ))
            : categories?.map((category) => (
                <div
                  key={category.id}
                  className="bg-white group-hover:md:bg-[#444444] border border-[#eeeeee] group-hover:md:border-[#EEEEEE1A] rounded-full py-1 px-2"
                >
                  <p className="text-muted-foreground text-xs group-hover:md:text-white">
                    {category.name}
                  </p>
                </div>
              ))}
        </div>
      </div>
    </Wrapper>
  );
};

export default ShowcaseCard;
