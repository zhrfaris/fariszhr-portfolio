import { z } from "zod";

export const DeleteCategory = z.object({
  id: z.string(),
});
