import { z } from "zod";
import { Post } from "@prisma/client";
import { CreatePost } from "./schema";
import { ActionState } from "@/lib/create-safe-action";

export type InputType = z.infer<typeof CreatePost>;
export type ReturnType = ActionState<InputType, Post>;
