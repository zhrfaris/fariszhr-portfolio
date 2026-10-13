import React, { forwardRef, useEffect, useState } from "react";
import { Input } from "../shadcn/input";
import { Label } from "../shadcn/label";
import { cn } from "@/lib/utils";
import FormErrors from "./form-errors";
import { ControlRow, FieldHint } from "@/components/dashboard/section-card";
import { Eye, EyeOff } from "lucide-react";

interface FormInputProps {
  id: string;
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  errors?: Record<string, string[] | undefined>;
  className?: string;
  defaultValue?: string;
  showTogglePassword?: boolean;
  value?: string | number;
  /** For type="number". */
  min?: number;
  max?: number;
  step?: number;
  onBlur?: () => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** "row": label (and hint) left, a short input right. Default: label above. */
  layout?: "stacked" | "row";
  /** Helper text: under the label (row) or under the input (stacked). */
  hint?: React.ReactNode;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      id,
      className,
      defaultValue,
      disabled,
      errors,
      label,
      onBlur,
      onChange,
      placeholder,
      required,
      type,
      readonly,
      value,
      showTogglePassword,
      min,
      max,
      step,
      layout = "stacked",
      hint,
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [currentType, setCurrentType] = useState(type);

    useEffect(() => {
      if (showPassword) {
        setCurrentType("text");
        return;
      }

      setCurrentType(type);
    }, [showPassword, type]);

    const field = (
      <div className="relative">
        <Input
          id={id}
          ref={ref}
          name={id}
          type={!showTogglePassword ? type : currentType}
          onBlur={onBlur}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          defaultValue={defaultValue}
          disabled={disabled}
          readOnly={readonly}
          value={value}
          min={min}
          max={max}
          step={step}
          className={cn(
            "px-4 flex items-center h-9",
            showTogglePassword && "pr-10",
            className
          )}
          aria-describedby={`${id}-error`}
          aria-hidden={readonly}
          tabIndex={readonly ? -1 : undefined}
        />
        {showTogglePassword && (
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        )}
      </div>
    );

    if (layout === "row") {
      return (
        <div className="space-y-2">
          <ControlRow id={id} label={label ?? ""} hint={hint}>
            {field}
          </ControlRow>
          <FormErrors id={id} errors={errors} />
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="space-y-2">
          {label && <Label htmlFor={id}>{label}</Label>}
          {field}
          {hint && <FieldHint>{hint}</FieldHint>}
        </div>
        <FormErrors id={id} errors={errors} />
      </div>
    );
  }
);

FormInput.displayName = "FormInput";

export default FormInput;
