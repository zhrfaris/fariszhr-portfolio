"use client";

import { changePassword } from "@/actions/user/change-password";
import FormInput from "@/components/form/form-input";
import { SectionCard } from "@/components/dashboard/section-card";
import {
  PAGE_SHELL,
  PageColumn,
  StickyActionBar,
} from "@/components/dashboard/page-layout";
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
    <form action={formAction} className={PAGE_SHELL}>
      <PageColumn>
        <SectionCard
          icon="changePassword"
          title="Change password"
          description="Enter your current password, then choose a new one."
        >
          <FormInput
            label="Current password"
            id="old_password"
            type="password"
            showTogglePassword={true}
            required={true}
            errors={fieldErrors}
          />
          <FormInput
            label="New password"
            id="new_password"
            type="password"
            showTogglePassword={true}
            required={true}
            errors={fieldErrors}
          />
          <FormInput
            label="Confirm new password"
            id="confirm_new_password"
            type="password"
            showTogglePassword={true}
            required={true}
            errors={fieldErrors}
          />
        </SectionCard>
      </PageColumn>

      <StickyActionBar>
        {/* Reset clears the three fields. */}
        <Button type="reset" variant="ghost" disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          Update password
        </Button>
      </StickyActionBar>
    </form>
  );
};

export default ChangePasswordForm;
