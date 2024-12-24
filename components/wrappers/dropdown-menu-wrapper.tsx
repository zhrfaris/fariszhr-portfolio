import React from "react";
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

export type DropdownMenuItem = {
  label: string;
  onClick?: () => void;
  href?: string;
  color?: "default" | "danger";
  Icon?: LucideIcon;
  disabled?: boolean;
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
  const MenuItem = ({
    label,
    onClick,
    href,
    color,
    Icon,
    disabled,
  }: DropdownMenuItem) => {
    const className = cn(
      color === "danger" && "text-red-500 focus:text-red-500 focus:bg-red-50"
    );

    if (href)
      <Link href={href}>
        <DropdownMenuItem className={className} disabled={disabled}>
          {Icon && <Icon />}
          <span>{label}</span>
        </DropdownMenuItem>
      </Link>;

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
    <DropdownMenu>
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
