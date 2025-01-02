import { getUserByUsername } from "@/actions/user/get";
import HeroSection from "@/components/home/hero-section";
import ShowcaseSection from "@/components/home/showcase-section";
import { MAIN_USERNAME } from "@/lib/db";
import { Suspense } from "react";

export default async function Home() {
  const user = await getUserByUsername(MAIN_USERNAME);

  return (
    <>
      <Suspense fallback={<HeroSection />}>
        <HeroSection user={user} />
      </Suspense>
      <ShowcaseSection user={user} />
    </>
  );
}
