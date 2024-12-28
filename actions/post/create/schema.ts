import { Image, Status } from "@/actions/types";
import { z } from "zod";

export const contentImageEnum = z.enum(["FULL", "DEFAULT"]);
export const contentImages = Object.values(contentImageEnum.Values);
export type ContentImageType = z.infer<typeof contentImageEnum>;

export const PostSectionContent = z.object({
  id: z.string(),
  order: z.number(),
  content: z.string({
    required_error: "Content is required",
    invalid_type_error: "Content is required",
  }),
  image: Image.optional().or(z.null()),
  content_image_type: contentImageEnum,
});

export const PostSection = z.object({
  id: z.string(),
  order: z.number(),
  title: z.string({
    required_error: "Title is required",
    invalid_type_error: "Title is required",
  }),
  icon_type: z.string({
    required_error: "Icon is required",
    invalid_type_error: "Icon is required",
  }),
  contents: z.array(PostSectionContent),
});

export const CreatePost = z.object({
  title: z.string({
    required_error: "Title is required",
    invalid_type_error: "Title is required",
  }),
  excerpt: z.string({
    required_error: "Short Description is required",
    invalid_type_error: "Short Description is required",
  }),
  status: Status,
  header_image: Image,
  thumbnail_image: Image,
  thumbnail_gif: Image.optional(),

  post_sections: z.array(PostSection),

  categoryIds: z.array(z.string()).optional(),
  workplaceId: z.string().optional(),
});
