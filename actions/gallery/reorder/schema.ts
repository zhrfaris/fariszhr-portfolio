import { z } from "zod";

export const ReorderGalleryPhotos = z
  .array(z.object({ id: z.string(), order: z.number().int() }))
  .min(1);
