import { z } from "zod";

export const DeleteManyWorkplaces = z.object({
  ids: z.array(z.string()),
});
