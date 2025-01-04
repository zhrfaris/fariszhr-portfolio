"use client";

import React from "react";
import { Button } from "../shadcn/button";
import { AlignJustify, FileText, Mail } from "lucide-react";
import {
  Sheet,
  // SheetClose,
  SheetContent,
  // SheetDescription,
  // SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../shadcn/sheet";
import NavButtons from "./nav-buttons";
import { User } from "@/actions/user/get/type";
import NavWrapper from "./nav-wrapper";
import Link from "next/link";
import MainButton from "../common/main-button";
import LinkedInIcon from "../icons/linkedin-icon";

const NavMobile = ({ user }: { user?: User }) => {
  return (
    <div className="md:hidden z-[60]">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            onClick={() => console.log("open mobile menu")}
          >
            <AlignJustify />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle></SheetTitle>
          </SheetHeader>
          <div className="py-4 px-2 flex flex-col justify-between h-full">
            <NavButtons className="flex flex-col gap-4 items-end" />

            {user && (
              <NavWrapper className="flex flex-col gap-4 items-end">
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
                  <Link
                    href={user?.cv_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
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
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default NavMobile;
