import React from "react";

const ShowcaseSectionWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div id="showcase" className="mb-12 pt-0">
      <div className="max-w-[820px] mx-auto flex items-center justify-stretch">
        <div className="grid grid-cols-12 w-full gap-4">{children}</div>
      </div>
    </div>
  );
};

export default ShowcaseSectionWrapper;
