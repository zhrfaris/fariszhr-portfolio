import { z } from "zod";
import { ReorderGalleryPhotos } from "./schema";
import { ActionState } from "@/lib/create-safe-action";

export type InputType = z.infer<typeof ReorderGalleryPhotos>;
export type ReturnType = ActionState<InputType, { count: number }>;
