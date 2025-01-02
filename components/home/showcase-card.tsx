import React from "react";

import styles from "./showcase-card.module.scss";
import { cn } from "@/lib/utils";
import { source_serif_pro } from "@/lib/fonts";
import Link from "next/link";
import Image from "next/image";

interface ShowcaseCardProps {
  title?: string;
  description?: string;
  image_url?: string;
  image_blur_data_url?: string;
  link?: string;
  target?: "_blank";
  className?: string;
  type?: "default" | "wide" | "small";
  prefetch?: boolean;
}

const ShowcaseCard = ({
  link,
  title,
  target,
  className,
  description,
  type = "default",
  image_blur_data_url,
  image_url,
  prefetch,
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

  const TitleNDesc = () => (
    <div
      className={cn(
        "text text-center",
        type === "wide" && "max-w-[150px] text-left",
        // type === "small" &&
        //   "max-w-[150px] md:max-w-[200px] text-left md:text-center"
        type === "small" && "max-w-[200px] text-center"
      )}
    >
      {title && (
        <h3
          className={cn(
            source_serif_pro.className,
            "text-sm font-semibold mb-1"
          )}
        >
          {title}
        </h3>
      )}
      {description && <p className="text-xs">{description}</p>}
    </div>
  );

  return (
    <Wrapper
      link={link}
      target={target}
      className={cn(
        "rounded-xl md:h-[215px] aspect-[2/1] md:aspect-auto overflow-hidden col-span-12",
        type === "default" && "md:col-span-6",
        type === "wide" && "md:col-span-7",
        type === "small" && "md:col-span-5",
        styles.card,
        className
      )}
    >
      <div
        className={cn(
          "size-full px-8 py-px flex justify-between items-center relative",
          type === "wide" ? "pl-4 md:pl-6 pr-0" : "flex-col gap-4 pt-4 px-0"
          // type === "small" && "flex-row gap-2 md:flex-col pl-4 md:pl-0"
        )}
      >
        <TitleNDesc />
        {image_url && (
          <div
            className={cn(
              "img flex-1 w-full h-full relative",
              type !== "wide" && "rounded-xl rounded-b-none"
            )}
          >
            <Image
              alt=""
              src={image_url}
              fill
              placeholder={image_blur_data_url ? "blur" : undefined}
              blurDataURL={image_blur_data_url}
              className={cn(
                "object-cover size-full md:object-contain",
                type === "wide"
                  ? "object-left-top md:object-center"
                  : "object-bottom",
                type === "small" && "object-contain"
              )}
            />
          </div>
        )}
        <div className="img_overlay absolute inset-x-0 bottom-0 w-full h-24 bg-gradient-to-t from-white/50 to-transparent" />
      </div>
    </Wrapper>
  );
};

export default ShowcaseCard;
