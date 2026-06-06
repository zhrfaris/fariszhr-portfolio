import React from "react";
import ShowcaseCard from "./showcase-card";
import ShowcaseSectionWrapper from "./showcase-section-wrapper";
import { Post } from "./hero-section";

const ShowcaseSection = async ({ posts }: { posts: Post[] }) => {
  return (
    <ShowcaseSectionWrapper>
      <>
        {posts.map((post, index) => (
          <ShowcaseCard
            key={post.id}
            title={post.title}
            description={post.excerpt}
            categories={post.categories}
            link={
              post.post_sections?.length > 0
                ? `/portfolios/${post.slug}`
                : `/coming-soon`
            }
            image_url={
              index === 0
                ? "/turning-raw-data.png"
                : index === 1
                  ? "/extend-booking-mid-service.png"
                  : index === 2
                    ? "/crypto-staking.png"
                    : "/making-movement-visible.png"
            }
          />
        ))}
      </>
    </ShowcaseSectionWrapper>
  );
};

export default ShowcaseSection;
