import { auth } from "@/auth";
import { redirect } from "next/navigation";
// import DbPageWrapper from "@/components/dashboard/page-wrapper";
// import React from "react";

const DashboardPage = async () => {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  redirect("/dashboard/profile/edit-profile");

  // return (
  //   <DbPageWrapper title="Dashboard">
  //     <h1>Dashboard</h1>
  //   </DbPageWrapper>
  // );
};

export default DashboardPage;
