import { z } from "zod";

export const DeleteWorkplace = z.object({
  id: z.string(),
});
