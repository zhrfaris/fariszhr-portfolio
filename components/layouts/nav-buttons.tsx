"use client";

import React from "react";
import NavWrapper from "./nav-wrapper";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "../shadcn/button";
import useLenisScroll from "@/hooks/use-lenis-scroll";

const NavButtons = ({ className }: { className?: string }) => {
  const pathname = usePathname();
  const { scrollToSectionId, scrollToTop } = useLenisScroll();

  const classNameStyle =
    "font-semibold hover:bg-transparent hover:text-black !text-base";

  return (
    <NavWrapper className={className}>
      {pathname !== "/" ? (
        <>
          <Link
            href={"/"}
            className={buttonVariants({
              className: classNameStyle,
              variant: "ghost",
            })}
          >
            Home
          </Link>
          <Link
            href={"/#showcase"}
            className={buttonVariants({
              className: classNameStyle,
              variant: "ghost",
            })}
          >
            Works & Experiences
          </Link>
        </>
      ) : (
        <>
          <Button
            onClick={scrollToTop}
            variant={"ghost"}
            className={classNameStyle}
          >
            Home
          </Button>
          <Button
            onClick={() => scrollToSectionId("showcase")}
            variant={"ghost"}
            className={classNameStyle}
          >
            Works & Experiences
          </Button>
        </>
      )}
    </NavWrapper>
  );
};

export default NavButtons;
