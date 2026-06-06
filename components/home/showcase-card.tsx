import React from "react";

import styles from "./showcase-card.module.scss";
import { cn } from "@/lib/utils";
import { source_serif_pro } from "@/lib/fonts";
import Link from "next/link";
import Image from "next/image";
import { Category } from "./hero-section";

interface ShowcaseCardProps {
  title?: string;
  description?: string;
  image_url?: string;
  link?: string;
  target?: "_blank";
  className?: string;
  prefetch?: boolean;
  categories?: Category[];
}

const ShowcaseCard = ({
  link,
  title,
  target,
  className,
  description,
  image_url,
  prefetch,
  categories,
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
    <div className="text flex-1 text-left pl-2 pr-4">
      {title && (
        <h3
          className={cn(
            source_serif_pro.className,
            "text-sm font-semibold mb-1",
          )}
        >
          {title}
        </h3>
      )}
      {description && (
        <p className="text-[11px] text-[#545A5F]">{description}</p>
      )}
    </div>
  );

  return (
    <Wrapper
      link={link}
      target={target}
      className={cn(
        "rounded-xl overflow-hidden col-span-12 md:col-span-6",
        styles.card,
        className,
      )}
    >
      <div className={cn("p-1 flex justify-between items-center")}>
        {image_url && (
          <div
            className={cn(
              "img size-[200px] relative rounded-[8px] overflow-hidden",
            )}
          >
            <Image
              alt=""
              src={image_url}
              fill
              className={cn(
                "object-cover size-full md:object-contain object-left-top md:object-center",
              )}
            />
            <div className="img_overlay absolute inset-x-0 bottom-0 w-full h-[40px] bg-gradient-to-t from-[#f5f5f5] to-transparent z-10" />
          </div>
        )}
        <TitleNDesc />
      </div>
      <div className="hidden md:flex items-center gap-1 py-2 px-3">
        {categories?.map((category) => (
          <div
            key={category.id}
            className="bg-white border border-[#eeeeee] rounded-full py-1 px-2"
          >
            <p className="text-muted-foreground text-xs">{category.name}</p>
          </div>
        ))}
      </div>
    </Wrapper>
  );
};

export default ShowcaseCard;
