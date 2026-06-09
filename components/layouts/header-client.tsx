"use client";

import Link from "next/link";

// import NavMobile from "./nav-mobile";
import NavButtons from "./nav-buttons";
import NavWrapper from "./nav-wrapper";
import styles from "./header.module.scss";
import LinkedInIcon from "../icons/linkedin-icon";

import { cn } from "@/lib/utils";
// import { Suspense, useRef, useState } from "react";
import { useRef, useState } from "react";
import { IconMailFilled } from "@tabler/icons-react";
import PaperIcon from "../icons/paper-icon";
import { User } from "@/actions/user/get/type";
import { useLenis } from "lenis/react";

const HeaderClient = ({ user }: { user?: User }) => {
  const [isScrolledPast50, setIsScrolledPast50] = useState(false);
  const wasPast50 = useRef(false);

  useLenis(({ scroll }) => {
    const past50 = scroll > 50;
    // Only re-render when crossing the threshold (avoids re-rendering every frame)
    if (past50 !== wasPast50.current) {
      wasPast50.current = past50;
      setIsScrolledPast50(past50);
    }
  });

  return (
    <div
      className={cn(
        "fixed w-screen top-0 z-50 p-4 md:px-12 flex items-center justify-between bg-[#f5f5f5] md:bg-transparent",
      )}
    >
      <NavButtons />
      {/* <SocialButtons /> */}
      <NavWrapper className="md:gap-8">
        {user?.email && (
          <Link
            href={`mailto:${user?.email}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex items-center gap-1 group">
              <IconMailFilled />
              <p
                className={cn(
                  "hidden md:block min-w-0 whitespace-nowrap group-hover:underline text-sm transition-all duration-300 ease-in-out overflow-hidden max-w-[200px]",
                  isScrolledPast50 && "max-w-0 opacity-0",
                )}
              >
                {user?.email}
              </p>
            </div>
          </Link>
        )}
        {user?.linkedin_url && (
          <Link
            href={user?.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex items-center gap-1 group">
              <LinkedInIcon />
              <p
                className={cn(
                  "hidden md:block min-w-0 whitespace-nowrap group-hover:underline text-sm transition-all duration-300 ease-in-out overflow-hidden max-w-[200px]",
                  isScrolledPast50 && "max-w-0 opacity-0",
                )}
              >
                linkedin.com/fariszhr
              </p>
            </div>
          </Link>
        )}

        {user?.cv_url && (
          <Link href={user?.cv_url} target="_blank" rel="noopener noreferrer">
            <div className="flex items-center gap-1 group">
              <PaperIcon />
              <p
                className={cn(
                  "hidden md:block min-w-0 whitespace-nowrap group-hover:underline text-sm transition-all duration-300 ease-in-out overflow-hidden max-w-[200px]",
                  isScrolledPast50 && "max-w-0 opacity-0",
                )}
              >
                Download CV
              </p>
            </div>
          </Link>
        )}
      </NavWrapper>

      {/* mobile menu */}
      {/* <Suspense fallback={<NavMobile />}>
        <NavMobile user={user} />
      </Suspense> */}

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

export default HeaderClient;
