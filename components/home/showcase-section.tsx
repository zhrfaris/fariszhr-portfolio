import React from "react";
import ShowcaseCard from "./showcase-card";
import ShowcaseSectionWrapper from "./showcase-section-wrapper";
import { Post } from "./hero-section";

const ShowcaseSection = async ({ posts }: { posts: Post[] }) => {
  return (
    <ShowcaseSectionWrapper>
      <>
        {posts.map((post) => (
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
            image_url={post.thumbnail_image.img_url}
          />
        ))}
      </>
    </ShowcaseSectionWrapper>
  );
};

export default ShowcaseSection;
