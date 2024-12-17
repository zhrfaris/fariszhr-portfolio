import { z } from "zod";
import { CreateCategory } from "../create/schema";

export const UpdateCategory = CreateCategory.merge(
  z.object({ id: z.string() })
);
