import { z } from "zod";

export const UnassignPostFromCategory = z.object({
  id: z.string(),
  parentId: z.string(),
});
