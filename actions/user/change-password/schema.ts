import { z } from "zod";

export const ChangePassword = z.object({
  old_password: z.string({
    required_error: "Old Password is required",
    invalid_type_error: "Old Password is required",
  }),
  new_password: z
    .string({
      required_error: "New Password is required",
      invalid_type_error: "New Password is required",
    })
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password must be at most 32 characters"),
  confirm_new_password: z.string({
    required_error: "New Password Confirmation is required",
    invalid_type_error: "New Password Confirmation is required",
  }),
});
