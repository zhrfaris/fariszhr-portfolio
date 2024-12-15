import { z } from "zod";
import { Image } from "@/actions/types";

export const CreateUser = z.object({
  name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name is required",
  }),
  username: z.string({
    required_error: "Username is required",
    invalid_type_error: "Username is required",
  }),
  email: z.string({
    required_error: "Email is required",
    invalid_type_error: "Email is required",
  }),
  password: z.string({
    required_error: "Password is required",
    invalid_type_error: "Password is required",
  }),
  occupation: z.string({
    required_error: "Occupation is required",
    invalid_type_error: "Occupation is required",
  }),
  tagline: z.string({
    required_error: "Tagline is required",
    invalid_type_error: "Tagline is required",
  }),
  cv_url: z.string().optional(),
  deck_intro_url: z.string().optional(),
  linkedin_url: z.string().optional(),
  photo: Image.optional(),

  workplace_ids: z.array(z.string()).optional(),
  post_ids: z.array(z.string()).optional(),
  category_ids: z.array(z.string()).optional(),
});
