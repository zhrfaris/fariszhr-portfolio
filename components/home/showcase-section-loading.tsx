import React from "react";
import ShowcaseCard from "./showcase-card";

const ShowcaseSectionLoading = async () => {
  return (
    <div id="showcase" className="min-h-screen px-4 mb-12">
      <div className="max-w-screen-lg mx-auto min-h-screen flex items-center justify-stretch">
        <div className="grid grid-cols-12 w-full gap-4 gap-y-6">
          <ShowcaseCard />
          <ShowcaseCard />
          {Array.from({ length: 4 }).map((_, index) => (
            <ShowcaseCard
              key={index}
              type={index % 3 === 0 ? "wide" : "small"}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShowcaseSectionLoading;
