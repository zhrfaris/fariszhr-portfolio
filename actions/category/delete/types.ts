import { z } from "zod";
import { Category } from "@prisma/client";
import { DeleteCategory } from "./schema";
import { ActionState } from "@/lib/create-safe-action";

export type InputType = z.infer<typeof DeleteCategory>;
export type ReturnType = ActionState<InputType, Category>;
