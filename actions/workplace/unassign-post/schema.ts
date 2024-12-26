import { z } from "zod";

export const UnassignPostFromWorkplace = z.object({
  id: z.string(),
  parentId: z.string(),
});
