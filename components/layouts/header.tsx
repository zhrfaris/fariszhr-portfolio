"use client";

import Link from "next/link";
import React, { useEffect } from "react";

import styles from "./header.module.scss";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "../shadcn/button";
import { AlignJustify, FileText, Mail } from "lucide-react";
import useLenisScroll from "@/hooks/use-lenis-scroll";
import { usePathname } from "next/navigation";
import MainButton from "../common/main-button";
import LinkedInIcon from "../icons/linkedin-icon";
import { usePublicData } from "@/hooks/use-pablic-data";
import { User } from "@/actions/user/get/type";

const Header = ({ user }: { user: User }) => {
  const { scrollToSectionId, scrollToTop } = useLenisScroll();
  const setUser = usePublicData((state) => state.setUser);
  const pathname = usePathname();

  useEffect(() => {
    if (!user) return;
    setUser(user);
  }, [user, setUser]);

  const NavWrapper = ({ children }: { children: React.ReactNode }) => (
    <nav className="z-50 hidden md:flex items-center gap-4">{children}</nav>
  );

  const consoleLog = () => console.log("clicked");

  const NavButtons = () => {
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

  const SocialButtons = () => {
    return (
      <NavWrapper>
        {user?.linkedin_url && (
          <Link
            href={user?.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MainButton rounded={true} size="icon">
              <LinkedInIcon className="!size-6" />
            </MainButton>
          </Link>
        )}
        {user?.cv_url && (
          <Link href={user?.cv_url} target="_blank" rel="noopener noreferrer">
            <MainButton rounded={true}>
              <FileText />
              Download CV
            </MainButton>
          </Link>
        )}
        {user?.email && (
          <Link
            href={`mailto:${user?.email}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MainButton rounded={true}>
              <Mail />
              Contact Me
            </MainButton>
          </Link>
        )}
      </NavWrapper>
    );
  };

  return (
    <div
      className={cn(
        "fixed w-screen top-0 z-50 p-4 md:px-12 flex items-center justify-end md:justify-between"
      )}
    >
      <NavButtons />
      <SocialButtons />

      {/* mobile menu */}
      <div className="md:hidden z-[60]">
        <Button size="icon" onClick={consoleLog}>
          <AlignJustify />
        </Button>
      </div>

      {/* gradient blur background */}
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
