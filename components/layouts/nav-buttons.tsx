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

  return (
    <NavWrapper className={className}>
      {pathname !== "/" ? (
        <>
          <Link
            href={"/"}
            className={buttonVariants({
              className:
                "font-semibold hover:bg-transparent hover:text-black text-base",
              variant: "ghost",
            })}
          >
            Home
          </Link>
          <Link
            href={"/#showcase"}
            className={buttonVariants({
              className:
                "font-semibold hover:bg-transparent hover:text-black text-base",
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
            className="font-semibold hover:bg-transparent hover:text-black text-base"
          >
            Home
          </Button>
          <Button
            onClick={() => scrollToSectionId("showcase")}
            variant={"ghost"}
            className="font-semibold hover:bg-transparent hover:text-black text-base"
          >
            Works & Experiences
          </Button>
        </>
      )}
    </NavWrapper>
  );
};

export default NavButtons;
