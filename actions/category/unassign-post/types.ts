import { ActionState } from "@/lib/create-safe-action";
import { UnassignInput } from "@/components/form/form-combobox/form-combobox";

export type InputType = UnassignInput;
export type ReturnType = ActionState<InputType, { message: string }>;
