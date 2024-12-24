import React, { forwardRef, useEffect, useState } from "react";
import { Input } from "../shadcn/input";
import { Label } from "../shadcn/label";
import { cn } from "@/lib/utils";
import FormErrors from "./form-errors";
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
  onBlur?: () => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      id,
      className,
      defaultValue = "",
      disabled,
      errors,
      label,
      onBlur,
      onChange,
      placeholder,
      required,
      type,
      readonly,
      showTogglePassword,
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
              className={cn(
                "px-4 flex items-center bg-muted text-base h-9",
                className
              )}
              aria-describedby={`${id}-error`}
              aria-hidden={readonly}
              tabIndex={readonly ? -1 : undefined}
            />
            {!showPassword && showTogglePassword && (
              <Eye
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 h-full cursor-pointer"
              />
            )}
            {showPassword && showTogglePassword && (
              <EyeOff
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 h-full cursor-pointer"
              />
            )}
          </div>
        </div>
        <FormErrors id={id} errors={errors} />
      </div>
    );
  }
);

FormInput.displayName = "FormInput";

export default FormInput;
