import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../shadcn/dropdown-menu";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import AlertDialogWrapper from "./alert-dialog-wrapper";

export type DropdownMenuItem = {
  label: string;
  onClick?: () => void;
  href?: string;
  color?: "default" | "danger";
  Icon?: LucideIcon;
  disabled?: boolean;
  showAlert?: boolean;
};

interface DropdownMenuWrapperProps {
  children: React.ReactNode;
  title?: string;
  listMenu: DropdownMenuItem[];
  align?: "center" | "end" | "start";
}

const DropdownMenuWrapper = ({
  children,
  title,
  listMenu,
  align = "start",
}: DropdownMenuWrapperProps) => {
  const [alertOpen, setAlertOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const MenuItem = ({
    label,
    onClick,
    href,
    color,
    Icon,
    disabled,
    showAlert,
  }: DropdownMenuItem) => {
    const className = cn(
      color === "danger" && "text-red-500 focus:text-red-500 focus:bg-red-50"
    );

    if (href) {
      return (
        <Link href={href}>
          <DropdownMenuItem className={className} disabled={disabled}>
            {Icon && <Icon />}
            <span>{label}</span>
          </DropdownMenuItem>
        </Link>
      );
    }

    if (showAlert) {
      return (
        <AlertDialogWrapper
          open={alertOpen}
          setOpen={setAlertOpen}
          header="Are you sure?"
          description="This action cannot be undone."
          cancelHandler={() => setDropdownOpen(false)}
          proceedHandler={() => {
            setDropdownOpen(false);

            if (onClick) {
              setTimeout(() => {
                onClick();
              }, 100);
            }
          }}
        >
          <DropdownMenuItem
            className={className}
            disabled={disabled}
            onSelect={(e) => {
              e.preventDefault();
              setAlertOpen(true);
            }}
          >
            {Icon && <Icon />}
            <span>{label}</span>
          </DropdownMenuItem>
        </AlertDialogWrapper>
      );
    }

    return (
      <DropdownMenuItem
        onClick={onClick}
        className={className}
        disabled={disabled}
      >
        {Icon && <Icon />}
        <span>{label}</span>
      </DropdownMenuItem>
    );
  };

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {title && (
          <>
            <DropdownMenuLabel>{title}</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        {listMenu.map((item, index) => (
          <MenuItem key={index} {...item} />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropdownMenuWrapper;
