import React from "react";

import styles from "./showcase-card.module.scss";
import { cn } from "@/lib/utils";
import { source_serif_pro } from "@/lib/fonts";

const ShowcaseCard = ({
  title,
  description,
  type = "default",
  className,
}: {
  title: string;
  description: string;
  type?: "default" | "wide" | "small";
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "rounded-xl h-[215px] overflow-hidden col-span-12",
        type === "default" && "md:col-span-6",
        type === "wide" && "md:col-span-8",
        type === "small" && "md:col-span-4",
        styles.card,
        className
      )}
    >
      <div
        className={cn(
          "size-full px-8 py-px flex gap-4 justify-between items-center",
          type !== "wide" && "flex-col pt-4"
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
            "img border border-zinc-900 flex-1 w-full h-full",
            type !== "wide" && "rounded-xl rounded-b-none"
          )}
        ></div>
      </div>
    </div>
  );
};

export default ShowcaseCard;
