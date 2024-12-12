import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";

const DashboardPage = async () => {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <h1 className="font-bold text-3xl">Home</h1>
    </>
  );
};

export default DashboardPage;
