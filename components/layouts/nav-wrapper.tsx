import React from "react";

const NavWrapper = ({ children }: { children: React.ReactNode }) => (
  <nav className="z-50 hidden md:flex items-center gap-4">{children}</nav>
);

export default NavWrapper;
