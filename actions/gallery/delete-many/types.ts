import { z } from "zod";
import { DeleteGalleryPhotos } from "./schema";
import { ActionState } from "@/lib/create-safe-action";

export type InputType = z.infer<typeof DeleteGalleryPhotos>;
export type ReturnType = ActionState<InputType, { count: number }>;
