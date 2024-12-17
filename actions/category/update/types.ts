import { z } from "zod";
import { Category } from "@prisma/client";
import { UpdateCategory } from "./schema";
import { ActionState } from "@/lib/create-safe-action";

export type InputType = z.infer<typeof UpdateCategory>;
export type ReturnType = ActionState<InputType, Category>;
