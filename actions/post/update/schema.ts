import { z } from "zod";
import { CreatePost } from "../create/schema";

export const UpdatePost = CreatePost.merge(z.object({ id: z.string() }));
