import { z } from "zod";
import { CreateWorkplace } from "../create/schema";

export const UpdateWorkplace = CreateWorkplace.merge(
  z.object({ id: z.string() })
);
