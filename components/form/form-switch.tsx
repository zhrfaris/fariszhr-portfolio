import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import FormErrors from "./form-errors";
import { Switch } from "../shadcn/switch";
import { ControlRow } from "@/components/dashboard/section-card";

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
  hint?: React.ReactNode;
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
      hint,
    },
    ref
  ) => {
    // A settings row: label (and hint) left, switch right.
    return (
      <div className={cn("space-y-2", className)}>
        <ControlRow id={id} label={label} hint={hint}>
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
          />
        </ControlRow>
        <FormErrors id={id} errors={errors} />
      </div>
    );
  }
);

FormSwitch.displayName = "FormSwitch";

export default FormSwitch;
