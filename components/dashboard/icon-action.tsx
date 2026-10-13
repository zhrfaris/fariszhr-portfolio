import React from "react";

import { Button, ButtonProps } from "@/components/shadcn/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";
import { cn } from "@/lib/utils";

/**
 * The dashboard's icon-only action (image slots, table rows, photo tiles):
 * 32×32, white, 1px border, 6px radius, no shadow. Always pass `aria-label`.
 * Forwards its ref, so it works as an `asChild` trigger.
 */
export const IconAction = React.forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, "size" | "variant"> & {
    "aria-label": string;
    destructive?: boolean;
  }
>(({ destructive, className, type = "button", ...props }, ref) => (
  <Button
    ref={ref}
    type={type}
    variant="outline"
    size="icon"
    className={cn(
      "size-8 rounded-md border-border bg-background hover:bg-muted",
      destructive
        ? "text-destructive hover:text-destructive"
        : "text-foreground hover:text-foreground",
      className
    )}
    {...props}
  />
));
IconAction.displayName = "IconAction";

/** Hover / focus label for an icon action (needs a TooltipProvider above). */
export function ActionTooltip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
