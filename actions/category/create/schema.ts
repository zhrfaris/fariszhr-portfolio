import { z } from "zod";

export const CreateCategory = z.object({
  name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name is required",
  }),
  post_ids: z.array(z.string()).optional(),
});
