"use client";

import React from "react";
import NavWrapper from "./nav-wrapper";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "../shadcn/button";
import useLenisScroll from "@/hooks/use-lenis-scroll";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

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
    classNameItem,
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
              className: cn(
                "flex items-center gap-4 !px-2 md:px-4",
                classNameStyle,
              ),
              variant: "ghost",
            })}
            onClick={afterClickHandler}
          >
            <ArrowLeft size={48} />
            <span className="text-sm">Back to home</span>
          </Link>
          {/* <Link
            href={"/#showcase"}
            className={buttonVariants({
              className: classNameStyle,
              variant: "ghost",
            })}
            onClick={afterClickHandler}
          >
            Works & Experiences
          </Link> */}
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
