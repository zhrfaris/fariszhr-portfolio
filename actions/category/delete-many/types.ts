import { z } from "zod";
import { Category } from "@prisma/client";
import { DeleteManyCategories } from "./schema";
import { ActionState } from "@/lib/create-safe-action";

export type InputType = z.infer<typeof DeleteManyCategories>;
export type ReturnType = ActionState<InputType, Category[]>;
