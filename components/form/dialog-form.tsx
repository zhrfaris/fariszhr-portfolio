/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { ElementRef, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../shadcn/dialog";

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

interface DialogFormProps<TData, TAdditionalProps = {}> {
  children: React.ReactNode;
  initialData?: TData;
  FormComponent: React.ComponentType<BasicFormProps<TData, TAdditionalProps>>;
  title: string;
  description?: string;
  className?: string;
}

/**
 * A button that when clicked, opens a popover containing a form.
 * The form is passed as a child and can be a React component.
 * The button itself can be a React component or a string.
 *
 * @param {DialogFormProps} props
 * @param {React.ReactNode} props.children The React component or string that will be rendered as the button.
 * @param {React.ReactNode} props.form The React component that will be rendered as the form in the popover.
 * @param {string} props.title The title that will be rendered above the form in the popover.
 * @param {string} [props.side="bottom"] The side of the popover that will be aligned with the button.
 * @param {string} [props.align="center"] The alignment of the popover relative to the button.
 * @param {number} [props.sideOffset=0] The offset of the popover from the button on the specified side.
 */
function DialogForm<TData>({
  initialData,
  children,
  title,
  description,
  FormComponent,
  className,
}: DialogFormProps<TData>) {
  const closeRef = useRef<ElementRef<"button">>(null);

  const handleSubmit = () => {
    closeRef.current?.click();
  };

  return (
    // <Popover>
    //   <PopoverTrigger asChild>{children}</PopoverTrigger>
    //   <PopoverContent
    //     align={align}
    //     className={cn("w-80 pt-3", className)}
    //     side={side}
    //     sideOffset={sideOffset}
    //   >
    //     <div className="text-sm font-medium text-center text-foreground/60 pb-4">
    //       {title}
    //     </div>
    //     <PopoverClose ref={closeRef} asChild>
    //       <Button
    //         variant="ghost"
    //         className="h-auto w-auto p-2 absolute top-2 right-2 text-foreground/60"
    //       >
    //         <XIcon className="h-4 w-4" />
    //       </Button>
    //     </PopoverClose>
    //     <FormComponent onSubmit={handleSubmit} initialData={initialData} />
    //   </PopoverContent>
    // </Popover>
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className={cn("sm:max-w-[425px]", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <FormComponent onSubmit={handleSubmit} initialData={initialData} />
        {/* <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}

export default DialogForm;
