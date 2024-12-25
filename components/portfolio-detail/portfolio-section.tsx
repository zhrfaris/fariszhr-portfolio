import React from "react";
import { source_serif_pro } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { PostSection } from "@/actions/post/create/types";
import SanitizedHtml from "../common/sanitized-html";
import { SectionIcon } from "../form/form-select-icon";
import { iconTypeChecker } from "@/lib/icons";

interface PortfolioSectionProps {
  section: PostSection;
}

const PortfolioSection = ({ section }: PortfolioSectionProps) => {
  return (
    <div className="section space-y-4 pb-6 border-b">
      <div className="section-title flex items-center gap-4">
        {/* <div className="size-8 rounded-full bg-[#3251a5]"></div> */}
        <SectionIcon
          size={38}
          iconId={iconTypeChecker(section.icon_type)}
          alt={`icon of ${section.icon_type}`}
        />
        <h3 className={cn(source_serif_pro.className, "text-xl font-bold")}>
          {section.title}
        </h3>
      </div>
      <div>
        {section.contents.map((content) => (
          <div key={content.id}>
            <SanitizedHtml innerHTML={content.content} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioSection;
