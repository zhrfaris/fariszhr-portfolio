import { Metadata } from "next";

import { getPublicGalleryPhotos, getUser } from "@/components/landing/data";
import LandingIntro, { LandingContent } from "@/components/landing/landing-intro";
import PhotoGrid from "@/components/landing/photo-grid";

export const metadata: Metadata = {
  title: "Photo works",
  alternates: { canonical: "/photography" },
};

export default async function PhotographyPage() {
  const [user, photos] = await Promise.all([
    getUser(),
    getPublicGalleryPhotos(),
  ]);

  return (
    <>
      <LandingIntro text={user?.intro_photo} />
      <LandingContent>
        <PhotoGrid photos={photos} />
      </LandingContent>
    </>
  );
}

