import { z } from "zod";

export const DeleteGalleryPhotos = z.object({
  ids: z.array(z.string()).min(1),
});
