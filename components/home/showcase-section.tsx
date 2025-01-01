"use client";

import React from "react";
import ShowcaseCard from "./showcase-card";
import { usePublicData } from "@/hooks/use-pablic-data";
import { PostsShowCase } from "@/actions/post/get/types";

const ShowcaseSection = ({ posts }: { posts: PostsShowCase }) => {
  const { user } = usePublicData((state) => state);

  return (
    <div id="showcase" className="min-h-screen px-4 mb-12">
      <div className="max-w-screen-lg mx-auto min-h-screen flex items-center justify-stretch">
        <div className="grid grid-cols-12 w-full gap-4 gap-y-6">
          <ShowcaseCard
            title="Download Introduction Deck"
            description="Learn more about me and the company I've collaborated with"
            link={user?.deck_intro_url ?? "#"}
            target="_blank"
            image_url="/intro_deck_thumbnail.png"
          />
          <ShowcaseCard
            title="Download CV"
            description="Explore my career achievements"
            link={user?.cv_url ?? "#"}
            target="_blank"
            image_url="/cv_thumbnail.png"
          />
          {posts.map((post, index) => (
            <ShowcaseCard
              key={post.id}
              title={post.title}
              description={post.excerpt}
              link={`/portfolios/${post.slug}`}
              image_url={post.thumbnail_image.img_url}
              image_blur_data_url={post.thumbnail_image.img_url_placeholder}
              type={index % 3 === 0 ? "wide" : "small"}
              prefetch={true}
            />
          ))}
          {/* <ShowcaseCard
            title="Add Service Duration During Ongoing Order"
            description="Enable customer to extend the service duration"
            type="wide"
            link="/portfolios/add-service-duration-during-ongoing-order"
          />
          <ShowcaseCard
            title="Crypto Staking"
            description="Lock crypto coin for specific period to earn interest"
            type="small"
            link="/portfolios/crypto-staking"
          />
          <ShowcaseCard
            title="Shopping Voucher Revamp"
            description="Shop faster with barnd's refreshed design"
            type="small"
            link="/portfolios/shopping-voucher-revamp"
          />
          <ShowcaseCard
            title="Redefine Homepage Visual & Surfacing Voucher"
            description="Create a cohesive design across platform & simplify access to various voucher"
            type="wide"
            link="/portfolios/redefine-homepage-visual-and-surfacing-voucher"
          /> */}
        </div>
      </div>
    </div>
  );
};

export default ShowcaseSection;
