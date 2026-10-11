import { getUserById } from "@/actions/user/get";
import { auth } from "@/auth";
import DbPageWrapper from "@/components/dashboard/page-wrapper";
import LandingForm from "@/components/dashboard/landing/landing-form";
import { redirect } from "next/navigation";
import React from "react";

const LandingPage = async () => {
  const session = await auth();

  if (!session?.user.id) {
    redirect("/login");
  }

  const user = await getUserById(session?.user?.id);

  return (
    <DbPageWrapper title="Landing Page">
      <LandingForm user={user} />
    </DbPageWrapper>
  );
};

export default LandingPage;
