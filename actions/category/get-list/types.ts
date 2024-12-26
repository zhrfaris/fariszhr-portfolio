import { z } from "zod";
import { GetCategories } from "./schema";
import { ActionState } from "@/lib/create-safe-action";
import { FormComboboxBaseData } from "@/components/form/form-combobox/form-combobox";

export type InputType = z.infer<typeof GetCategories>;
export type ReturnType = ActionState<
  InputType,
  NonNullable<FormComboboxBaseData>[]
>;
