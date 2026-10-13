/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { ElementRef, useRef } from "react";
import { Button } from "@/components/shadcn/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RequiredFormProps {
  onSubmit?: () => void;
}

// Generic type for form props that combines required base props with optional data and additional props
export type BasicFormProps<
  TData = any,
  TAdditionalProps = {}
> = RequiredFormProps & {
  initialData?: TData;
} & TAdditionalProps;

interface PopoverFormProps<TData, TAdditionalProps = {}> {
  children: React.ReactNode;
  initialData?: TData;
  FormComponent: React.ComponentType<BasicFormProps<TData, TAdditionalProps>>;
  title: string;
  side?: "left" | "right" | "top" | "bottom";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  className?: string;
}

/**
 * A button that when clicked, opens a popover containing a form.
 * The form is passed as a child and can be a React component.
 * The button itself can be a React component or a string.
 *
 * @param {PopoverFormProps} props
 * @param {React.ReactNode} props.children The React component or string that will be rendered as the button.
 * @param {React.ReactNode} props.form The React component that will be rendered as the form in the popover.
 * @param {string} props.title The title that will be rendered above the form in the popover.
 * @param {string} [props.side="bottom"] The side of the popover that will be aligned with the button.
 * @param {string} [props.align="center"] The alignment of the popover relative to the button.
 * @param {number} [props.sideOffset=0] The offset of the popover from the button on the specified side.
 */
function PopoverForm<TData>({
  side,
  align,
  sideOffset,
  initialData,
  children,
  title,
  FormComponent,
  className,
}: PopoverFormProps<TData>) {
  const closeRef = useRef<ElementRef<"button">>(null);

  const handleSubmit = () => {
    closeRef.current?.click();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align={align}
        className={cn("w-80 pt-3", className)}
        side={side}
        sideOffset={sideOffset}
      >
        <div className="pb-4 pr-8 text-[15px] font-medium text-foreground">
          {title}
        </div>
        <PopoverClose ref={closeRef} asChild>
          <Button
            variant="ghost"
            className="h-auto w-auto p-2 absolute top-2 right-2 text-muted-foreground"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </PopoverClose>
        <FormComponent onSubmit={handleSubmit} initialData={initialData} />
      </PopoverContent>
    </Popover>
  );
}

export default PopoverForm;
