import { z } from "zod";

export const DeleteManyPosts = z.object({
  ids: z.array(z.string()),
});
