import { z } from "zod";
import { ChangePassword } from "./schema";
import { ActionState } from "@/lib/create-safe-action";

export type InputType = z.infer<typeof ChangePassword>;
export type ReturnType = ActionState<InputType, { message: string }>;
