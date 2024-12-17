import { auth } from "@/auth";
import DbPageWrapper from "@/components/dashboard/page-wrapper";
import { redirect } from "next/navigation";
import React from "react";

const DashboardPage = async () => {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <DbPageWrapper title="Dashboard">
      <h1>Dashboard</h1>
    </DbPageWrapper>
  );
};

export default DashboardPage;
