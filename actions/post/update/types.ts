import { z } from "zod";
import { Post } from "@prisma/client";
import { UpdatePost } from "./schema";
import { ActionState } from "@/lib/create-safe-action";

export type InputType = z.infer<typeof UpdatePost>;
export type ReturnType = ActionState<InputType, Post>;
