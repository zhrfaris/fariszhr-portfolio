"use client";

import Link from "next/link";
import React from "react";

import styles from "./header.module.scss";
import { cn } from "@/lib/utils";
import { Button } from "../shadcn/button";
import { AlignJustify } from "lucide-react";

const Header = () => {
  const NavWrapper = ({ children }: { children: React.ReactNode }) => (
    <nav className="z-50 hidden md:flex items-center gap-6 ">{children}</nav>
  );

  const consoleLog = () => console.log("clicked");

  return (
    <div
      className={cn(
        "fixed w-screen top-0 z-50 p-4 md:px-12 flex items-center justify-end md:justify-between"
      )}
    >
      <NavWrapper>
        <Link href={"/"} className="font-semibold">
          Home
        </Link>
        <Link href={"/#showcase"} className="font-semibold">
          Works & Experiences
        </Link>
      </NavWrapper>
      <NavWrapper>
        <Link href={"/"} className="font-semibold">
          Download CV
        </Link>
        <Link href={"/#showcase"} className="font-semibold">
          Contact Me
        </Link>
      </NavWrapper>
      <div className="md:hidden z-[60]">
        <Button size="icon" onClick={consoleLog}>
          <AlignJustify />
        </Button>
      </div>
      <div className={cn(styles.gradientBlur)}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};

export default Header;
