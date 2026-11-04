import DbPageWrapper from "@/components/dashboard/page-wrapper";
import ChangePasswordForm from "@/components/dashboard/profile/change-password-form";
import React from "react";

const ChangePasswordPage = () => {
  return (
    <DbPageWrapper title="Password" bare>
      <ChangePasswordForm />
    </DbPageWrapper>
  );
};

export default ChangePasswordPage;
