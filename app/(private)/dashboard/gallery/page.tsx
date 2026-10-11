import { getGalleryPhotos } from "@/actions/gallery/get";
import { auth } from "@/auth";
import DbPageWrapper from "@/components/dashboard/page-wrapper";
import GalleryManager from "@/components/dashboard/gallery/gallery-manager";
import { redirect } from "next/navigation";
import React from "react";

const GalleryPage = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const photos = await getGalleryPhotos(session.user.id);

  return (
    <DbPageWrapper title="Photo Works">
      <GalleryManager initialPhotos={photos} />
    </DbPageWrapper>
  );
};

export default GalleryPage;
