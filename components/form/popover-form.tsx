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

export interface BasicFormProps<TData> {
  initialData?: TData;
  onSubmit?: () => void;
}

interface PopoverFormProps<TData> {
  children: React.ReactNode;
  initialData?: TData;
  FormComponent: React.ComponentType<BasicFormProps<TData>>;
  title: string;
  side?: "left" | "right" | "top" | "bottom";
  align?: "start" | "center" | "end";
  sideOffset?: number;
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
        className="w-80 pt-3"
        side={side}
        sideOffset={sideOffset}
      >
        <div className="text-sm font-medium text-center text-foreground/60 pb-4">
          {title}
        </div>
        <PopoverClose ref={closeRef} asChild>
          <Button
            variant="ghost"
            className="h-auto w-auto p-2 absolute top-2 right-2 text-foreground/60"
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
