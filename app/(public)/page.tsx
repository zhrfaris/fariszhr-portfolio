import HeroSection from "@/components/home/hero-section";
import ShowcaseSection from "@/components/home/showcase-section";

import { Suspense } from "react";
import { MAIN_USERNAME } from "@/lib/db";
import { unstable_cache } from "next/cache";
import { getUserByUsername } from "@/actions/user/get";

const getUser = unstable_cache(
  async () => {
    return await getUserByUsername(MAIN_USERNAME);
  },
  ["user"],
  { revalidate: 60 * 10, tags: ["user"] }
);

export default async function Home() {
  const user = await getUser();

  return (
    <>
      <Suspense fallback={<HeroSection />}>
        <HeroSection user={user} />
      </Suspense>
      <ShowcaseSection user={user} />
    </>
  );
}
