"use client";

import Link from "next/link";

import styles from "./home.module.css";
import { User } from "@/actions/user/get/type";
import { IconMailFilled } from "@tabler/icons-react";
import LinkedInIcon from "../icons/linkedin-icon";
import PaperIcon from "../icons/paper-icon";

const SiteFooter = ({
  user,
  onBackToTop,
}: {
  user?: User;
  onBackToTop: () => void;
}) => (
  <footer className={styles.siteFooter}>
    <div className={`${styles.wrap} ${styles.footerInner}`}>
      <div className={styles.links}>
        {user?.email && (
          <Link href={`mailto:${user.email}`}>
            <IconMailFilled size={16} />
            {user.email}
          </Link>
        )}
        {user?.linkedin_url && (
          <Link
            href={user.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkedInIcon />
            linkedin.com/fariszhr
          </Link>
        )}
        {user?.cv_url && (
          <Link href={user.cv_url} target="_blank" rel="noopener noreferrer">
            <PaperIcon />
            Download CV
          </Link>
        )}
      </div>
      <button type="button" className={styles.top} onClick={onBackToTop}>
        &uarr; Back to top
      </button>
    </div>
  </footer>
);

export default SiteFooter;
