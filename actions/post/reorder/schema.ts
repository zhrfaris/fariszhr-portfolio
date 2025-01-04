import { z } from "zod";

export const ReorderPost = z.array(
  z.object({ id: z.string(), order: z.number().nullable() })
);
