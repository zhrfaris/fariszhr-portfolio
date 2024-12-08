import React from "react";
import ShowcaseCard from "./showcase-card";

const ShowcaseSection = () => {
  return (
    <div id="showcase" className="min-h-screen px-4 mb-12">
      <div className="max-w-screen-lg mx-auto min-h-screen flex items-center justify-stretch">
        <div className="grid grid-cols-12 w-full gap-4 gap-y-6">
          <ShowcaseCard
            title="Download Introduction Deck"
            description="Learn more about me and the company I've collaborated with"
          />
          <ShowcaseCard
            title="Download CV"
            description="Explore my career achievements"
          />
          <ShowcaseCard
            title="Add Service Duration During Ongoing Order"
            description="Enable customer to extend the service duration"
            type="wide"
            slug="add-service-duration-during-ongoing-order"
          />
          <ShowcaseCard
            title="Crypto Staking"
            description="Lock crypto coin for specific period to earn interest"
            type="small"
            slug="crypto-staking"
          />
          <ShowcaseCard
            title="Shopping Voucher Revamp"
            description="Shop faster with barnd's refreshed design"
            type="small"
            slug="shopping-voucher-revamp"
          />
          <ShowcaseCard
            title="Redefine Homepage Visual & Surfacing Voucher"
            description="Create a cohesive design across platform & simplify access to various voucher"
            type="wide"
            slug="redefine-homepage-visual-and-surfacing-voucher"
          />
        </div>
      </div>
    </div>
  );
};

export default ShowcaseSection;
