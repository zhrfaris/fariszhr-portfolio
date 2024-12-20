import { z } from "zod";
import { Post } from "@prisma/client";
import { DeleteManyPosts } from "./schema";
import { ActionState } from "@/lib/create-safe-action";

export type InputType = z.infer<typeof DeleteManyPosts>;
export type ReturnType = ActionState<InputType, Post[]>;
