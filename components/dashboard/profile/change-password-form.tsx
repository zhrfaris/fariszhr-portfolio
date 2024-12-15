"use client";

import { changePassword } from "@/actions/user/change-password";
import FormInput from "@/components/form/form-input";
import FormWrapper from "@/components/form/form-wrapper";
import { Button } from "@/components/shadcn/button";
import { useAction } from "@/hooks/use-action";
import React from "react";
import { toast } from "sonner";

const ChangePasswordForm = () => {
  const { execute, fieldErrors, isLoading } = useAction(changePassword, {
    onProceed() {
      toast.loading("Changing password...", { id: "loading-change-password" });
    },
    onError(error) {
      toast.error(error);
    },
    onSuccess() {
      toast.success("Password changed!");
    },
    onComplete() {
      toast.dismiss("loading-change-password");
    },
  });

  const formAction = (formData: FormData) => {
    const old_password = formData.get("old_password") as string;
    const new_password = formData.get("new_password") as string;
    const confirm_new_password = formData.get("confirm_new_password") as string;

    if (new_password !== confirm_new_password) {
      toast.error("Confirmation Passwords do not match!");
      return;
    }

    execute({ old_password, new_password, confirm_new_password });
  };

  return (
    <form action={formAction} className="flex-1 space-y-6">
      <FormWrapper>
        <FormInput
          label="Old Password"
          id="old_password"
          type="password"
          showTogglePassword={true}
          required={true}
          errors={fieldErrors}
        />
      </FormWrapper>
      <FormWrapper>
        <FormInput
          label="New Password"
          id="new_password"
          type="password"
          showTogglePassword={true}
          required={true}
          errors={fieldErrors}
        />
      </FormWrapper>
      <FormWrapper>
        <FormInput
          label="Coinfirm New Password"
          id="confirm_new_password"
          type="password"
          showTogglePassword={true}
          required={true}
          errors={fieldErrors}
        />
      </FormWrapper>
      <Button type="submit" disabled={isLoading}>
        Change Password
      </Button>
    </form>
  );
};

export default ChangePasswordForm;
