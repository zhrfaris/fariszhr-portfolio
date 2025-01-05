import { cn } from "@/lib/utils";
import React from "react";
import { Skeleton } from "../shadcn/skeleton";

const PortfolioSectionLoading = () => {
  return (
    <div className={cn("section space-y-4 pb-6 border-b")}>
      <div className="section-title flex items-center gap-4">
        <Skeleton className="h-9 w-10 rounded-full" />
        <Skeleton className="h-7 w-[120px] rounded-full" />
      </div>
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-6 w-full rounded-full" />
      ))}
      {/* <div className="space-y-6">
        <div className="space-y-6">
          <SanitizedHtml innerHTML={content.content} />
          <div
            className={cn(
              "w-full min-h-12 border border-[#d9d9dd9] overflow-hidden relative",
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
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default PortfolioSectionLoading;
