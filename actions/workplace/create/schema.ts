import { z } from "zod";
import { Image } from "@/actions/types";

export const CreateWorkplace = z.object({
  name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name is required",
  }),
  url: z.string().optional(),
  image: Image,
  post_ids: z.array(z.string()).optional(),
});
