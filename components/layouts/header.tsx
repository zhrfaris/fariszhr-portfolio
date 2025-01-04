import Link from "next/link";

import NavMobile from "./nav-mobile";
import NavButtons from "./nav-buttons";
import NavWrapper from "./nav-wrapper";
import styles from "./header.module.scss";
import MainButton from "../common/main-button";
import LinkedInIcon from "../icons/linkedin-icon";

import { cn } from "@/lib/utils";
import { FileText, Mail } from "lucide-react";
import { getUser } from "@/app/(public)/page";
import { Suspense } from "react";

const Header = async () => {
  const user = await getUser();

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
      <Suspense fallback={<NavMobile />}>
        <NavMobile user={user} />
      </Suspense>

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
