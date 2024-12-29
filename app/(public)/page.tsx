import { getUserByUsername } from "@/actions/user/get";
import { getWorkplacesBySlug } from "@/actions/workplace/get";
import HeroSection from "@/components/home/hero-section";
import ShowcaseSection from "@/components/home/showcase-section";
import { MAIN_USERNAME } from "@/lib/db";

export default async function Home() {
  const user = await getUserByUsername(MAIN_USERNAME);
  const workplaces = await getWorkplacesBySlug(MAIN_USERNAME);

  return (
    <>
      <HeroSection user={user} workplaces={workplaces} />
      <ShowcaseSection />
    </>
  );
}
