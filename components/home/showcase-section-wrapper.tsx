import React from "react";

const ShowcaseSectionWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div id="showcase" className="mb-12 pt-0">
      <div className="max-w-[832px] mx-auto flex items-center justify-stretch">
        {/* data-case-grid is the only hook the stacked-deck layer needs — the
            grid's own markup and styling stay exactly as they were */}
        <div data-case-grid className="grid grid-cols-12 w-full gap-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ShowcaseSectionWrapper;
