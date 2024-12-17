import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { buttonVariants } from "../shadcn/button";

const DbPageWrapper = ({
  title,
  children,
  createButtonUrl,
}: {
  title: string;
  children: React.ReactNode;
  createButtonUrl?: string;
}) => {
  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex items-center gap-8">
        <h1 className="font-bold text-3xl">{title}</h1>
        {createButtonUrl && (
          <Link
            href={createButtonUrl}
            className={cn(buttonVariants({ size: "sm" }))}
          >
            Create New
          </Link>
        )}
      </div>
      {children}
    </div>
  );
};

export default DbPageWrapper;
