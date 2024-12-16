import { z } from "zod";
import { Workplace } from "@prisma/client";
import { DeleteWorkplace } from "./schema";
import { ActionState } from "@/lib/create-safe-action";

export type InputType = z.infer<typeof DeleteWorkplace>;
export type ReturnType = ActionState<InputType, Workplace>;
