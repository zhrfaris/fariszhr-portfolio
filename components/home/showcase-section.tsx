import { cn } from "@/lib/utils";
import React from "react";

import styles from "./showcase-section.module.scss";
import { source_serif_pro } from "@/lib/fonts";

const ShowcaseSection = () => {
  const Card = ({
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
          "rounded-xl h-[215px] overflow-hidden",
          type === "default" && "col-span-6",
          type === "wide" && "col-span-8",
          type === "small" && "col-span-4",
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

  return (
    <div id="showcase" className="min-h-screen">
      <div className="max-w-screen-lg mx-auto min-h-screen flex items-center justify-stretch">
        <div className="grid grid-cols-12 w-full gap-4 gap-y-6">
          <Card
            title="Download Introduction Deck"
            description="Learn more about me and the company I've collaborated with"
          />
          <Card
            title="Download CV"
            description="Explore my career achievements"
          />
          <Card
            title="Add Service Duration During Ongoing Order"
            description="Enable customer to extend the service duration"
            type="wide"
          />
          <Card
            title="Crypto Staking"
            description="Lock crypto coin for specific period to earn interest"
            type="small"
          />
          <Card
            title="Shopping Voucher Revamp"
            description="Shop faster with barnd's refreshed design"
            type="small"
          />
          <Card
            title="Redefine Homepage Visual & Surfacing Voucher"
            description="Create a cohesive design across platform & simplify access to various voucher"
            type="wide"
          />
        </div>
      </div>
    </div>
  );
};

export default ShowcaseSection;
