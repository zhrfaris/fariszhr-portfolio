import React, { Dispatch, SetStateAction } from "react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover";

interface props {
  triggerComponent: React.ReactNode;
  children: React.ReactNode;
  alignContent?: "center" | "end" | "start";
  alignOffsetContent?: number;
  contentSide?: "top" | "right" | "bottom" | "left";
  sideOffsetContent?: number;
  className?: string;
  open?: boolean | undefined;
  setOpen?: Dispatch<SetStateAction<boolean>>;
}

const PopoverWrapper = ({
  children,
  triggerComponent,
  className,
  alignContent = "end",
  alignOffsetContent = -20,
  contentSide = "top",
  sideOffsetContent = 8,
  open,
  setOpen,
}: props) => {
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{triggerComponent}</PopoverTrigger>
      <PopoverContent
        asChild
        autoFocus={false}
        align={alignContent}
        alignOffset={alignOffsetContent}
        sideOffset={sideOffsetContent}
        side={contentSide}
        className={cn("w-fit", className)}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
};

export default PopoverWrapper;
