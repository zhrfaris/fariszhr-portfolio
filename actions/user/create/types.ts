import { z } from "zod";
import { User } from "@prisma/client";
import { CreateUser } from "./schema";
import { ActionState } from "@/lib/create-safe-action";

export type InputType = z.infer<typeof CreateUser>;
export type ReturnType = ActionState<InputType, User>;
