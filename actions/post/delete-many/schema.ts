import { z } from "zod";

export const DeleteManyCategories = z.object({
  ids: z.array(z.string()),
});
