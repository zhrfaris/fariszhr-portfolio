"use client";

import React, { Dispatch, forwardRef, SetStateAction } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/shadcn/alert-dialog";

interface AlertDialogWrapperProps {
  children: React.ReactNode;
  header: string;
  description?: string;
  open?: boolean;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  proceedHandler: () => void;
  cancelHandler?: () => void;
}

const AlertDialogWrapper = forwardRef<
  HTMLButtonElement,
  AlertDialogWrapperProps
>(
  (
    {
      open,
      header,
      children,
      description,
      setOpen,
      cancelHandler,
      proceedHandler,
    },
    ref
  ) => {
    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger ref={ref} asChild>
          {children}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{header}</AlertDialogTitle>
            {description && (
              <AlertDialogDescription>{description}</AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelHandler}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={proceedHandler}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
);

AlertDialogWrapper.displayName = "AlertDialogWrapper";

export default AlertDialogWrapper;
