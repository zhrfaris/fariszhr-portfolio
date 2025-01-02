"use client";

import React from "react";
import NavWrapper from "./nav-wrapper";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "../shadcn/button";
import useLenisScroll from "@/hooks/use-lenis-scroll";

const NavButtons = () => {
  const pathname = usePathname();
  const { scrollToSectionId, scrollToTop } = useLenisScroll();

  return (
    <NavWrapper>
      {pathname !== "/" ? (
        <>
          <Link
            href={"/"}
            className={buttonVariants({
              className:
                "font-semibold hover:bg-transparent hover:text-black text-base",
              variant: "ghost",
            })}
            prefetch={true}
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
            prefetch={true}
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
