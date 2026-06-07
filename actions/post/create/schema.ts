import { Image, Status } from "@/actions/types";
import { z } from "zod";

export const contentRadiusNum: Record<
  ContentImageRadiusNum,
  ContentImageRadiusType
> = {
  "4px": "SM",
  "6px": "MD",
  "8px": "LG",
  "12px": "XL",
  "16px": "XXL",
  "24px": "XXXL",
};

export const contentImageRadiusNumEnum = z.enum([
  "4px",
  "6px",
  "8px",
  "12px",
  "16px",
  "24px",
]);
export const contentImageRadiusEnum = z.enum([
  "SM",
  "MD",
  "LG",
  "XL",
  "XXL",
  "XXXL",
]);
export const contentImageRadius = Object.values(contentImageRadiusEnum.Values);
export const contentImageRadiusNum = Object.values(
  contentImageRadiusNumEnum.Values,
);
export type ContentImageRadiusNum = z.infer<typeof contentImageRadiusNumEnum>;
export type ContentImageRadiusType = z.infer<typeof contentImageRadiusEnum>;

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
  content_image_radius: contentImageRadiusEnum.or(z.null()),
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
  thumbnail_gif: Image.optional().or(z.null()),

  isRestricted: z.boolean().optional(),
  password: z.string().optional().nullable(),
  previewSectionAmount: z.number().optional().nullable(),

  post_sections: z.array(PostSection),

  categoryIds: z.array(z.string()).optional(),
  workplaceId: z.string().optional(),
});
