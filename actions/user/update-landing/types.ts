import { z } from "zod";
import { User } from "@prisma/client";
import { UpdateLanding } from "./schema";
import { ActionState } from "@/lib/create-safe-action";

export type InputType = z.infer<typeof UpdateLanding>;
export type ReturnType = ActionState<InputType, User>;
