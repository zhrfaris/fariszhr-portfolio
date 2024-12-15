import React, { forwardRef } from "react";
import { Label } from "../shadcn/label";
import { cn } from "@/lib/utils";
import FormErrors from "./form-errors";
import { Textarea } from "../shadcn/textarea";

interface FormTextareaProps {
  id: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  errors?: Record<string, string[] | undefined>;
  className?: string;
  defaultValue?: string;
  onBlur?: () => void;
}

const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      id,
      className,
      defaultValue = "",
      disabled,
      errors,
      label,
      onBlur,
      placeholder,
      required,
      readonly,
    },
    ref
  ) => {
    return (
      <div className="space-y-3">
        <div className="space-y-2">
          {label && (
            <Label
              htmlFor={id}
              className="text-sm font-semibold text-foreground/70"
            >
              {label}
            </Label>
          )}
          <div className="relative">
            <Textarea
              id={id}
              ref={ref}
              name={id}
              onBlur={onBlur}
              required={required}
              placeholder={placeholder}
              defaultValue={defaultValue}
              disabled={disabled}
              readOnly={readonly}
              className={cn(
                "px-4 flex items-center bg-muted text-base h-9",
                className
              )}
              aria-describedby={`${id}-error`}
              aria-hidden={readonly}
              tabIndex={readonly ? -1 : undefined}
            />
          </div>
        </div>
        <FormErrors id={id} errors={errors} />
      </div>
    );
  }
);

FormTextarea.displayName = "FormTextarea";

export default FormTextarea;
