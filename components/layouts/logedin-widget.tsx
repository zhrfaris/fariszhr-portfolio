import Link from "next/link";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../shadcn/avatar";
import { auth } from "@/auth";

const LogedinWidget = async () => {
  const session = await auth();

  if (!session?.user?.id) return null;

  return (
    <Link
      href={"/dashboard"}
      className="size-10 rounded-full shadow-2xl border border-input"
    >
      <Avatar className="size-full">
        <AvatarImage src="/avatar.png" />
        <AvatarFallback>ZHR</AvatarFallback>
      </Avatar>
    </Link>
  );
};

export default LogedinWidget;
