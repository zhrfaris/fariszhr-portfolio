import Link from "next/link";

import styles from "./header.module.scss";
import { cn } from "@/lib/utils";
import { FileText, Mail } from "lucide-react";
import MainButton from "../common/main-button";
import LinkedInIcon from "../icons/linkedin-icon";
import { Avatar, AvatarFallback, AvatarImage } from "../shadcn/avatar";
import NavWrapper from "./nav-wrapper";
import NavButtons from "./nav-buttons";
import NavMobile from "./nav-mobile";
import { auth } from "@/auth";
import { getUserByUsername } from "@/actions/user/get";
import { MAIN_USERNAME } from "@/lib/db";

const Header = async () => {
  const session = await auth();
  const user = await getUserByUsername(MAIN_USERNAME);

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
        {session?.user?.id && (
          <Link
            href={"/dashboard"}
            className="size-10 rounded-full shadow-2xl border border-input"
          >
            <Avatar className="size-full">
              <AvatarImage src="/avatar.png" />
              <AvatarFallback>ZHR</AvatarFallback>
            </Avatar>
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
      <NavMobile />

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
