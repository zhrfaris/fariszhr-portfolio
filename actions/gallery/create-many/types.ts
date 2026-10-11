import { z } from "zod";
import { GalleryPhoto } from "@prisma/client";
import { CreateGalleryPhotos } from "./schema";
import { ActionState } from "@/lib/create-safe-action";

export type InputType = z.infer<typeof CreateGalleryPhotos>;
export type ReturnType = ActionState<InputType, GalleryPhoto[]>;
