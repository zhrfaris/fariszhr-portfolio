import { getPostsShowCase } from "@/actions/post/get";
import { getWorkplacesBySlug } from "@/actions/workplace/get";
import HeroSection from "@/components/home/hero-section";
import ShowcaseSection from "@/components/home/showcase-section";
import { MAIN_USERNAME } from "@/lib/db";

export default async function Home() {
  const workplaces = await getWorkplacesBySlug(MAIN_USERNAME);
  const posts = await getPostsShowCase(MAIN_USERNAME);

  return (
    <>
      <HeroSection workplaces={workplaces} />
      <ShowcaseSection posts={posts} />
    </>
  );
}
