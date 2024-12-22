import { z } from "zod";

export const Image = z.object({
  public_id: z.string(),
  img_url: z.string(),
  img_url_thumbnail: z.string(),
  img_url_placeholder: z.string(),
  img_width: z.number(),
  img_height: z.number(),
  img_type: z.string().nullish(),
});

export const Status = z.enum(["ACTIVE", "INACTIVE"]);
