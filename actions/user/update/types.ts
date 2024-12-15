import { z } from "zod";
import { User } from "@prisma/client";
import { UpdateUser } from "./schema";
import { ActionState } from "@/lib/create-safe-action";

export type InputType = z.infer<typeof UpdateUser>;
export type ReturnType = ActionState<InputType, User>;
