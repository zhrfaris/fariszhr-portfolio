import { auth } from "@/auth";
import { SignIn } from "@/components/auth/sign-in";
import { redirect } from "next/navigation";
import React from "react";

const Login = async () => {
  const session = await auth();

  if (!!session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <SignIn />
    </div>
  );
};

export default Login;
