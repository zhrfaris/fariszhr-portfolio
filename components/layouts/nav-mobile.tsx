"use client";

import React, { useState } from "react";
import { Button } from "../shadcn/button";
import { AlignJustify, FileText, Mail } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../shadcn/sheet";
import NavButtons from "./nav-buttons";
import { User } from "@/actions/user/get/type";
import NavWrapper from "./nav-wrapper";
import Link from "next/link";
import MainButton from "../common/main-button";
import { LinkedInLogoIcon } from "@radix-ui/react-icons";

const NavMobile = ({ user }: { user?: User }) => {
  const [open, setOpen] = useState(false);

  const clickNavButtonHandler = () => {
    setOpen(false);
  };

  return (
    <div className="md:hidden z-[60]">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline">
            <AlignJustify />
          </Button>
        </SheetTrigger>
        <SheetContent className="p-4 w-full">
          <SheetHeader>
            <SheetTitle></SheetTitle>
          </SheetHeader>
          <div className="py-4 px-0 flex flex-col justify-between h-full">
            <NavButtons
              classNameWrapper="flex flex-col gap-4 items-end"
              classNameItem="w-full"
              afterClick={() => setOpen(false)}
            />

            {user && (
              <NavWrapper className="flex flex-col gap-4 items-end">
                {user?.cv_url && (
                  <Link
                    href={user?.cv_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                    onClick={clickNavButtonHandler}
                  >
                    <MainButton className="w-full" rounded={true}>
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
                    className="w-full"
                  >
                    <MainButton className="w-full" rounded={true}>
                      <Mail />
                      Contact Me
                    </MainButton>
                  </Link>
                )}
                {user?.linkedin_url && (
                  <Link
                    href={user?.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <MainButton className="w-full" rounded={true}>
                      <LinkedInLogoIcon />
                      Linkedin
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
