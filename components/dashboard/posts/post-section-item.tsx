import { PostSection } from "@/actions/post/create/types";
import PortfolioSection from "@/components/portfolio-detail/portfolio-section";
import React from "react";

const PostSectionItem = ({ section }: { section: PostSection }) => {
  return (
    <div className="border  w-full p-4 rounded-md mb-4">
      <PortfolioSection section={section} />
    </div>
  );
};

export default PostSectionItem;
