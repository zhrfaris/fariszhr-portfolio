import { Prisma } from "@prisma/client";
import { getGalleryPhotos, getPublicGalleryPhotos } from ".";

export type GalleryPhoto = Prisma.PromiseReturnType<
  typeof getGalleryPhotos
>[number];
export type PublicGalleryPhoto = Awaited<
  ReturnType<typeof getPublicGalleryPhotos>
>[number];
