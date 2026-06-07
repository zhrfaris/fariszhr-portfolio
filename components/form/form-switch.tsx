import React, { forwardRef } from "react";
import { Label } from "../shadcn/label";
import { cn } from "@/lib/utils";
import FormErrors from "./form-errors";
import { Switch } from "../shadcn/switch";

interface FormSwitchProps {
  id: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  errors?: Record<string, string[] | undefined>;
  className?: string;
  defaultValue?: string;
  value?: boolean;
  onBlur?: () => void;
  onCheckedChange?: (checked: boolean) => void;
}

const FormSwitch = forwardRef<HTMLButtonElement, FormSwitchProps>(
  (
    {
      id,
      className,
      defaultValue,
      disabled,
      errors,
      label,
      onBlur,
      required,
      readonly,
      onCheckedChange,
      value,
    },
    ref,
  ) => {
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Switch
            id={id}
            ref={ref}
            name={id}
            onBlur={onBlur}
            required={required}
            defaultValue={defaultValue}
            disabled={disabled}
            checked={value}
            onCheckedChange={onCheckedChange}
            aria-describedby={`${id}-error`}
            aria-hidden={readonly}
            tabIndex={readonly ? -1 : undefined}
            className={cn(className)}
          />
          <Label
            htmlFor={id}
            className="text-sm font-semibold text-foreground/70"
          >
            {label}
          </Label>
        </div>
        <FormErrors id={id} errors={errors} />
      </div>
    );
  },
);

FormSwitch.displayName = "FormSwitch";

export default FormSwitch;
