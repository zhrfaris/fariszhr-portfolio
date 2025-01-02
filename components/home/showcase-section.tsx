import React from "react";
import ShowcaseCard from "./showcase-card";
import { MAIN_USERNAME } from "@/lib/db";
import { getPostsShowCase } from "@/actions/post/get";
import { User } from "@/actions/user/get/type";

const ShowcaseSection = async ({ user }: { user: User }) => {
  const posts = await getPostsShowCase(MAIN_USERNAME);

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
        </div>
      </div>
    </div>
  );
};

export default ShowcaseSection;
