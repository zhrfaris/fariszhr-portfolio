import { z } from "zod";
import { Workplace } from "@prisma/client";
import { DeleteManyWorkplaces } from "./schema";
import { ActionState } from "@/lib/create-safe-action";

export type InputType = z.infer<typeof DeleteManyWorkplaces>;
export type ReturnType = ActionState<InputType, Workplace[]>;
