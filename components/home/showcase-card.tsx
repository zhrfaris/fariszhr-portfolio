import React from "react";

import styles from "./showcase-card.module.scss";
import { cn } from "@/lib/utils";

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

  // const TitleNDesc = () => (
  //   <div className="text flex-1 text-left pl-2 pr-4">
  //     {title && (
  //       <h3
  //         className={cn(
  //           source_serif_pro.className,
  //           "text-sm font-semibold mb-1",
  //         )}
  //       >
  //         {title}
  //       </h3>
  //     )}
  //     {description && (
  //       <p className="text-[11px] text-[#545A5F]">{description}</p>
  //     )}
  //   </div>
  // );

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
              <div className="img_overlay absolute inset-x-0 bottom-0 w-full h-[40px] bg-gradient-to-t from-[#f5f5f5] to-transparent z-10 group-hover:md:from-[#353535]" />
            </div>
          )}
          <div className="text flex-1 text-left pl-2 pr-4">
            {title && (
              <h3
                className="text-sm font-semibold mb-1 leading-snug group-hover:md:text-[#ffffff]"
              >
                {title}
              </h3>
            )}
            {description && (
              <p className="text-[11px] leading-relaxed text-[#545A5F] group-hover:md:text-[#ffffff]">
                {description}
              </p>
            )}
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 py-0.5 px-3">
          {categories?.map((category) => (
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
