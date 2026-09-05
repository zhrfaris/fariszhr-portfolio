import { getUser } from "@/actions/user/get";
import { getPosts } from "@/components/home/hero-section";
import HomeExperience from "@/components/home/home-experience";
import HeroIdentity from "@/components/home/hero-identity";
import ShowcaseSection from "@/components/home/showcase-section";

export default async function Home() {
  const [user, posts] = await Promise.all([getUser(), getPosts()]);

  return (
    <HomeExperience
      user={user ?? undefined}
      identity={<HeroIdentity user={user ?? undefined} />}
      /* No Suspense boundary here: `posts` is already resolved above, so the
         boundary only ever deferred hydration of the grid — and the stacked
         deck writes to those nodes as soon as it mounts. */
      cases={<ShowcaseSection posts={posts} />}
    />
  );
}
