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
////1. make schemas for database
//// 2. make authentication
// 3. Figuring out TinyMCE upload image
// 4. update schema database PostSection untuk dynamic content text & image
// 5. Upload image to cloudinary
