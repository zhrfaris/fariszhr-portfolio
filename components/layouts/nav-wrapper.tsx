import { cn } from "@/lib/utils";
import React from "react";

const NavWrapper = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <nav className={cn("z-50 flex items-center gap-4", className)}>
    {children}
  </nav>
);

export default NavWrapper;
