import { z } from "zod";
import { Workplace } from "@prisma/client";
import { UpdateWorkplace } from "./schema";
import { ActionState } from "@/lib/create-safe-action";

export type InputType = z.infer<typeof UpdateWorkplace>;
export type ReturnType = ActionState<InputType, Workplace>;
