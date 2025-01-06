"use client";

import React from "react";
import NavWrapper from "./nav-wrapper";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "../shadcn/button";
import useLenisScroll from "@/hooks/use-lenis-scroll";
import { cn } from "@/lib/utils";

const NavButtons = ({
  classNameItem,
  classNameWrapper,
  afterClick,
}: {
  classNameItem?: string;
  classNameWrapper?: string;
  afterClick?: () => void;
}) => {
  const pathname = usePathname();
  const { scrollToSectionId, scrollToTop } = useLenisScroll();

  const classNameStyle = cn(
    "font-semibold hover:bg-transparent hover:text-black !text-base",
    classNameItem
  );

  const afterClickHandler = () => {
    if (afterClick) {
      afterClick();
    }
  };

  return (
    <NavWrapper className={classNameWrapper}>
      {pathname !== "/" ? (
        <>
          <Link
            href={"/"}
            className={buttonVariants({
              className: classNameStyle,
              variant: "ghost",
            })}
            onClick={afterClickHandler}
          >
            Home
          </Link>
          <Link
            href={"/#showcase"}
            className={buttonVariants({
              className: classNameStyle,
              variant: "ghost",
            })}
            onClick={afterClickHandler}
          >
            Works & Experiences
          </Link>
        </>
      ) : (
        <>
          <Button
            onClick={() => {
              scrollToTop();
              afterClickHandler();
            }}
            variant={"ghost"}
            className={classNameStyle}
          >
            Home
          </Button>
          <Button
            onClick={() => {
              scrollToSectionId("showcase");
              afterClickHandler();
            }}
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
