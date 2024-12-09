import { auth, signOut } from "@/auth";
import { Button } from "@/components/shadcn/button";
import { redirect } from "next/navigation";
import React from "react";

const DashboardPage = async () => {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Dashboard page</h1>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <Button type="submit" variant={"destructive"}>
          Logout
        </Button>
      </form>
      <div>
        <p>{JSON.stringify(session, null, 2)}</p>
      </div>
    </div>
  );
};

export default DashboardPage;
