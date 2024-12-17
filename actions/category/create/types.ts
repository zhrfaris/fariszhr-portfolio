import { z } from "zod";
import { Category } from "@prisma/client";
import { CreateCategory } from "./schema";
import { ActionState } from "@/lib/create-safe-action";

export type InputType = z.infer<typeof CreateCategory>;
export type ReturnType = ActionState<InputType, Category>;
