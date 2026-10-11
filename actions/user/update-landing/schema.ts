import { z } from "zod";
import { Image } from "@/actions/types";
import { LanyardSettingsSchema } from "@/lib/lanyard-settings";

export const UpdateLanding = z.object({
  intro_product: z
    .string()
    .max(1200, "Keep the intro under 1200 characters")
    .optional(),
  intro_photo: z
    .string()
    .max(1200, "Keep the intro under 1200 characters")
    .optional(),
  card_front: Image.nullable(),
  card_back: Image.nullable(),
  band_image: Image.nullable(),
  lanyard: LanyardSettingsSchema,
});
