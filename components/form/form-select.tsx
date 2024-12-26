import React, { forwardRef } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import { Label } from "../shadcn/label";
import FormErrors from "./form-errors";
import { capitalizeEachWord, cn } from "@/lib/utils";

interface FormSelectProps {
  id: string;
  values: string[];
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  errors?: Record<string, string[] | undefined>;
  defaultValue?: string;
  className?: string;
  onBlur?: () => void;
}

const FormSelect = forwardRef<HTMLInputElement, FormSelectProps>(
  (
    {
      id,
      defaultValue = "",
      disabled,
      errors,
      label,
      onBlur,
      placeholder,
      required,
      readonly,
      values,
      className,
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
          <Select
            name={id}
            required={required}
            disabled={disabled}
            defaultValue={defaultValue}
          >
            <SelectTrigger
              className={cn(
                "w-full px-4 flex items-center bg-muted text-base h-9",
                className
              )}
            >
              <SelectValue
                id={id}
                ref={ref}
                onBlur={onBlur}
                placeholder={placeholder}
                aria-describedby={`${id}-error`}
                aria-hidden={readonly}
                tabIndex={readonly ? -1 : undefined}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {values.map((v) => (
                  <SelectItem key={v} value={v}>
                    {capitalizeEachWord(v)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <FormErrors id={id} errors={errors} />
      </div>
    );
  }
);

FormSelect.displayName = "FormSelect";

export default FormSelect;
