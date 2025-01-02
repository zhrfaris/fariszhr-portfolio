import React from "react";
import ShowcaseCard from "./showcase-card";
import ShowcaseSectionWrapper from "./showcase-section-wrapper";

const ShowcaseSectionLoading = async () => {
  return (
    <ShowcaseSectionWrapper>
      <>
        <ShowcaseCard />
        <ShowcaseCard />
        {Array.from({ length: 4 }).map((_, index) => (
          <ShowcaseCard key={index} type={index % 3 === 0 ? "wide" : "small"} />
        ))}
      </>
    </ShowcaseSectionWrapper>
  );
};

export default ShowcaseSectionLoading;
