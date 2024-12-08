import HeroSection from "@/components/home/hero-section";
import ShowcaseSection from "@/components/home/showcase-section";

export default async function Home() {
  return (
    <>
      <HeroSection />
      <ShowcaseSection />
    </>
  );
}

// TODOList
// 1. make schemas for database
// 2. make authentication
// 3. Figuring out TinyMCE upload image
