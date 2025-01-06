import React from "react";

const ShowcaseSectionWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div id="showcase" className="min-h-screen px-4 mb-12 pt-[10vh] md:pt-0">
      <div className="max-w-[820px] mx-auto min-h-screen flex items-center justify-stretch">
        <div className="grid grid-cols-12 w-full gap-4 gap-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ShowcaseSectionWrapper;
