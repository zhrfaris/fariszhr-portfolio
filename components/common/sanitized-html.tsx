"use client";

import DOMPurify from "isomorphic-dompurify";
import { cn } from "@/lib/utils";
import { Button } from "@/components/shadcn/button";
import { ElementRef, useRef, useState } from "react";

type RestrictSize = "small" | "medium" | "large" | "xs";

interface SanitizedHtmlProps {
  innerHTML: string;
  className?: string;
  restrict?: RestrictSize;
  showMoreButton?: boolean;
}

const SanitizedHtml = ({
  innerHTML,
  className,
  restrict,
  showMoreButton = true,
}: SanitizedHtmlProps) => {
  const ref = useRef<ElementRef<"div">>(null);
  const [currRestrict, setCurrRestrict] = useState<RestrictSize | undefined>(
    restrict
  );

  return (
    <div
      ref={ref}
      className={cn("relative", restrict && showMoreButton && "mb-4 pb-2")}
    >
      <div
        id="innerHTML"
        className={cn(
          currRestrict && "overflow-hidden text-ellipsis",
          currRestrict === "large" &&
            "max-h-[500px] line-clamp-[12] 2xl:line-clamp-[14]",
          currRestrict === "medium" &&
            "max-h-[250px] line-clamp-[6] 2xl:line-clamp-[6]",
          currRestrict === "small" &&
            "max-h-[125px] line-clamp-[3] 2xl:line-clamp-[3]",
          currRestrict === "xs" &&
            "max-h-[125px] line-clamp-[2] 2xl:line-clamp-[2]",
          className
        )}
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(innerHTML),
        }}
      ></div>
      {currRestrict && showMoreButton && (
        <div className="absolute -bottom-6 inset-x-0 flex items-center justify-end">
          <Button
            variant="link"
            className="p-0"
            onClick={() => setCurrRestrict(undefined)}
          >
            Show more
          </Button>
        </div>
      )}
    </div>
  );
};

export default SanitizedHtml;
