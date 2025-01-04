import { z } from "zod";
import { Post } from "@prisma/client";
import { ReorderPost } from "./schema";
import { ActionState } from "@/lib/create-safe-action";

export type InputType = z.infer<typeof ReorderPost>;
export type ReturnType = ActionState<InputType, Post[]>;
