/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { ElementRef, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../shadcn/sheet";
import { ScrollArea } from "../shadcn/scroll-area";

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

interface SheetFormProps<TData, TAdditionalProps = {}> {
  children: React.ReactNode;
  initialData?: TData;
  FormComponent: React.ComponentType<BasicFormProps<TData, TAdditionalProps>>;
  title: string;
  description?: string;
  side?: "left" | "right" | "top" | "bottom";
  className?: string;
}

/**
 * A button that when clicked, opens a popover containing a form.
 * The form is passed as a child and can be a React component.
 * The button itself can be a React component or a string.
 *
 * @param {SheetFormProps} props
 * @param {React.ReactNode} props.children The React component or string that will be rendered as the button.
 * @param {React.ReactNode} props.form The React component that will be rendered as the form in the popover.
 * @param {string} props.title The title that will be rendered above the form in the popover.
 * @param {string} [props.side="bottom"] The side of the popover that will be aligned with the button.
 * @param {string} [props.align="center"] The alignment of the popover relative to the button.
 * @param {number} [props.sideOffset=0] The offset of the popover from the button on the specified side.
 */
function SheetForm<TData>({
  side,
  initialData,
  children,
  title,
  description,
  FormComponent,
  className,
}: SheetFormProps<TData>) {
  const closeRef = useRef<ElementRef<"button">>(null);

  const handleSubmit = () => {
    closeRef.current?.click();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className={cn(className)} side={side}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <ScrollArea className="h-[93vh] px-4">
          <FormComponent onSubmit={handleSubmit} initialData={initialData} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export default SheetForm;
