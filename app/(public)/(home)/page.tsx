import { getLandingPosts, getUser } from "@/components/landing/data";
import CaseGrid from "@/components/landing/case-grid";
import LandingIntro, { LandingContent } from "@/components/landing/landing-intro";

// The previous home page (HomeExperience, HeroIdentity, the showcase deck and
// the zine) is kept in components/home as a backup but no longer rendered.

export default async function Home() {
  const [user, posts] = await Promise.all([getUser(), getLandingPosts()]);

  return (
    <>
      <LandingIntro text={user?.intro_product} />
      <LandingContent>
        <CaseGrid posts={posts} />
      </LandingContent>
    </>
  );
}
