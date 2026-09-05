import { Suspense } from "react";

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
      cases={
        <Suspense fallback={null}>
          <ShowcaseSection posts={posts} />
        </Suspense>
      }
    />
  );
}
