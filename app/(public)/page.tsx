import HeroSection from "@/components/home/hero-section";

import { Suspense } from "react";
import { getUser } from "@/actions/user/get";

export default async function Home() {
  const user = await getUser();

  return (
    <>
      <Suspense fallback={<HeroSection />}>
        <HeroSection user={user} />
      </Suspense>
    </>
  );
}
