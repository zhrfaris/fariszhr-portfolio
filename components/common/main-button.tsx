import React, { forwardRef } from "react";
import { Button, ButtonProps } from "../shadcn/button";
import { cn } from "@/lib/utils";

import styles from "./main-button.module.scss";

const MainButton = forwardRef<
  HTMLButtonElement,
  ButtonProps & { rounded?: boolean }
>(({ children, className, rounded, size, ...props }, ref) => {
  return (
    <Button
      className={cn(
        "bg-gradient-to-b from-[#e9e9e9] to-white p-[3.5px] h-fit",
        rounded ? "rounded-full" : "rounded-[13.66px]",
        className
      )}
      ref={ref}
      {...props}
    >
      <span
        className={cn(
          "bg-gradient-to-b from-[#f4f4f4] to-[#fefefe] hover:from-[#353535] hover:to-[#666666] text-black hover:text-white flex items-center justify-center gap-2 transition-all duration-500 ease-in-out",
          size === "icon" ? "size-10 p-1" : "w-full h-10 py-2 px-4",
          rounded ? "rounded-full" : "rounded-[10.12px]",
          styles.innerButton
        )}
      >
        {children}
      </span>
    </Button>
  );
});

MainButton.displayName = "MainButton";

export default MainButton;
