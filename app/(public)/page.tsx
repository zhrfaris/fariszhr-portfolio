import { getPostsShowCase } from "@/actions/post/get";
import { getUserByUsername } from "@/actions/user/get";
import { getWorkplacesBySlug } from "@/actions/workplace/get";
import HeroSection from "@/components/home/hero-section";
import ShowcaseSection from "@/components/home/showcase-section";
import { MAIN_USERNAME } from "@/lib/db";

export default async function Home() {
  const userReq = getUserByUsername(MAIN_USERNAME);
  const workplacesReq = getWorkplacesBySlug(MAIN_USERNAME);

  const [user, workplaces] = await Promise.all([userReq, workplacesReq]);

  const posts = await getPostsShowCase(MAIN_USERNAME);

  return (
    <>
      <HeroSection user={user} workplaces={workplaces} />
      <ShowcaseSection posts={posts} />
    </>
  );
}
