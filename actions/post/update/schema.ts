import { z } from "zod";
import { CreatePost } from "../create/schema";

// `slug` is no longer sent from the UI — it is derived from the title on save.
// Kept optional for backward compatibility with any older callers.
export const UpdatePost = CreatePost.merge(
  z.object({ id: z.string(), slug: z.string().optional() })
);
