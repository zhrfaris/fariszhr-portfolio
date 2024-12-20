import { z } from "zod";
import { Post } from "@prisma/client";
import { DeletePost } from "./schema";
import { ActionState } from "@/lib/create-safe-action";

export type InputType = z.infer<typeof DeletePost>;
export type ReturnType = ActionState<InputType, Post>;
