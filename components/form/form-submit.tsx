"use client";

import { Button } from "../shadcn/button";
import { cn } from "@/lib/utils";

interface FormSubmitProps {
  children: React.ReactNode;
  onClick?: () => void;
  formId?: string;
  disabled?: boolean;
  className?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | null
    | undefined;
}

const FormSubmit = ({
  children,
  className,
  disabled,
  variant,
  formId,
  onClick,
}: FormSubmitProps) => {
  return (
    <Button
      type="submit"
      disabled={disabled}
      variant={variant}
      size="sm"
      className={cn(className)}
      form={formId}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

export default FormSubmit;
