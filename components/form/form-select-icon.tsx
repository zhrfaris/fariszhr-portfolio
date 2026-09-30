"use client";

import React, { forwardRef, useState } from "react";
import { Label } from "../shadcn/label";
import PopoverWrapper from "../wrappers/popover-wrapper";
import {
  iconTypeChecker,
  sectionIconList,
  SectionIconsValidation,
} from "@/lib/icons";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "../shadcn/button";
import { Input } from "../shadcn/input";
import FormErrors from "./form-errors";

interface FormSelectIconProps {
  id: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  errors?: Record<string, string[] | undefined>;
  defaultValue?: string;
  onBlur?: () => void;
}

const FormSelectIcon = forwardRef<HTMLInputElement, FormSelectIconProps>(
  ({ id, label, required, disabled, errors, defaultValue, onBlur }, ref) => {
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState<string | undefined>(
      defaultValue
    );

    const selectIconHandler = (icon: string) => {
      setSelectedIcon(icon);
      setPopoverOpen(false);
    };

    return (
      <div className="space-y-2">
        <div className="space-y-2">
          {label && (
            <Label
              htmlFor={id}
              className="text-sm font-semibold text-foreground/70"
            >
              <span>{label}</span>
              {required && <span className="text-red-600"> *</span>}
            </Label>
          )}
          <PopoverWrapper
            open={popoverOpen}
            setOpen={setPopoverOpen}
            alignContent="start"
            contentSide="bottom"
            triggerComponent={
              selectedIcon ? (
                <div className="cursor-pointer hover:bg-muted border rounded-md border-input h-9 flex items-center justify-center ">
                  <SectionIcon
                    size={24}
                    iconId={iconTypeChecker(selectedIcon)}
                    alt={`icon of ${selectedIcon}`}
                  />
                </div>
              ) : (
                <div className="p-2 text-sm border rounded-md cursor-pointer border-input px-4 flex items-center bg-muted">
                  Select an icon for the section
                </div>
              )
            }
          >
            <div className="max-w-[calc(60px*5+2rem)]">
              <div className="flex flex-wrap items-start justify-start w-full">
                {sectionIconList.map((icon, id) => (
                  <div
                    key={id}
                    onClick={() => selectIconHandler(icon)}
                    className="p-3 transition duration-300 cursor-pointer hover:bg-muted"
                  >
                    <SectionIcon
                      size={35}
                      iconId={iconTypeChecker(icon)}
                      alt={`icon of ${icon}`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end">
                <Button
                  variant="ghost"
                  className="font-bold text-red-700"
                  onClick={() => setPopoverOpen(false)}
                  type="button"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </PopoverWrapper>
          <Input
            onBlur={onBlur}
            value={selectedIcon ?? ""}
            onChange={() => {}}
            ref={ref}
            required={required}
            name={id}
            id={id}
            type="hidden"
            disabled={disabled}
            aria-describedby={`${id}-error`}
          />
        </div>
        <FormErrors id={id} errors={errors} />
      </div>
    );
  }
);

FormSelectIcon.displayName = "FormSelectIcon";

export default FormSelectIcon;

export const SectionIcon = ({
  iconId,
  alt = `${iconId} icon`,
  className = "",
  size = 30,
}: {
  iconId: SectionIconsValidation;
  alt?: string;
  className?: string;
  size?: number;
}) => {
  return (
    <Image
      src={`/icons/${iconId}.png`}
      alt={alt}
      width={size}
      height={size}
      className={cn(className)}
    />
  );
};
