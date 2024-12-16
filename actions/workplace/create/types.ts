import { z } from "zod";
import { Workplace } from "@prisma/client";
import { CreateWorkplace } from "./schema";
import { ActionState } from "@/lib/create-safe-action";

export type InputType = z.infer<typeof CreateWorkplace>;
export type ReturnType = ActionState<InputType, Workplace>;
