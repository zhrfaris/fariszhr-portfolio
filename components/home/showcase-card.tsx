import React from "react";

import styles from "./showcase-card.module.scss";
import { cn } from "@/lib/utils";
import { source_serif_pro } from "@/lib/fonts";
import Link from "next/link";
import Image from "next/image";

const ShowcaseCard = ({
  link,
  title,
  target,
  className,
  description,
  type = "default",
  image_blur_data_url,
  image_url,
}: {
  title: string;
  description: string;
  image_url: string;
  image_blur_data_url?: string;
  link?: string;
  target?: "_blank";
  className?: string;
  type?: "default" | "wide" | "small";
}) => {
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
        >
          {children}
        </Link>
      );
    }

    return <div className={className}>{children}</div>;
  };

  return (
    <Wrapper
      link={link}
      target={target}
      className={cn(
        "rounded-xl md:h-[277px] aspect-[2/1] md:aspect-auto overflow-hidden col-span-12",
        type === "default" && "md:col-span-6",
        type === "wide" && "md:col-span-8",
        type === "small" && "md:col-span-4",
        styles.card,
        className
      )}
    >
      <div
        className={cn(
          "size-full px-8 py-px flex gap-4 justify-between items-center relative",
          type !== "wide" && "flex-col pt-4 px-0",
          type === "wide" && "pl-4 md:pl-8 pr-0 md:pr-8"
          // type === "default" && "px-0"
        )}
      >
        <div
          className={cn(
            "text text-center",
            type === "wide" && "max-w-[150px] text-left",
            type === "small" && "max-w-[200px]"
          )}
        >
          <h3
            className={cn(
              source_serif_pro.className,
              "text-sm font-semibold mb-1"
            )}
          >
            {title}
          </h3>
          <p className="text-xs">{description}</p>
        </div>
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
                : "object-bottom"
            )}
          />
        </div>
        <div className="img_overlay absolute inset-x-0 bottom-0 w-full h-24 bg-gradient-to-t from-white/50 to-transparent" />
      </div>
    </Wrapper>
  );
};

export default ShowcaseCard;
