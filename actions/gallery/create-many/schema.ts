import { z } from "zod";
import { Image } from "@/actions/types";

export const CreateGalleryPhotos = z.object({
  images: z.array(Image).min(1).max(100),
});
