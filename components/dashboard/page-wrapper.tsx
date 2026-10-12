import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { Button, buttonVariants } from "../shadcn/button";
import PopoverForm, { BasicFormProps } from "../form/popover-form";

type ButtonLink = {
  href: string;
  children: React.ReactNode;
};

function DbPageWrapper<TData>({
  title,
  children,
  buttonLink,
  createButtonUrl,
  CreateFormComponent,
}: {
  title: string;
  children: React.ReactNode;
  createButtonUrl?: string;
  buttonLink?: ButtonLink;
  CreateFormComponent?: React.ComponentType<BasicFormProps<TData>>;
}) {
  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex items-center gap-8">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight">
          {title}
        </h1>
        {createButtonUrl && (
          <Link href={createButtonUrl} className={cn(buttonVariants())}>
            Create New
          </Link>
        )}
        {buttonLink && (
          <Link href={buttonLink.href} className={cn(buttonVariants())}>
            {buttonLink.children}
          </Link>
        )}
        {CreateFormComponent && (
          <PopoverForm
            align="start"
            title="Create Category"
            FormComponent={CreateFormComponent}
          >
            <Button>Create New</Button>
          </PopoverForm>
        )}
      </div>
      {children}
    </div>
  );
}

export default DbPageWrapper;
