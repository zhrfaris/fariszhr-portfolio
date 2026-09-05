"use client";

import React from "react";
import Link from "next/link";

import styles from "./home.module.css";
import { User } from "@/actions/user/get/type";

/**
 * All four icons come from public/icons and are drawn as masks, so they take
 * the label's colour and scale with its font-size. They used to come from three
 * different sources at three different sizes — a 16px Tabler glyph, two 24px
 * local components and a text arrow — which is why they never matched.
 */
const FooterIcon = ({ src }: { src: string }) => (
  <span
    aria-hidden
    className={styles.footerIcon}
    style={{ "--icon": `url("${src}")` } as React.CSSProperties}
  />
);

const SiteFooter = ({
  user,
  onBackToTop,
}: {
  user?: User;
  onBackToTop: () => void;
}) => (
  <footer className={styles.siteFooter}>
    {/* casesWrap, not wrap: the footer sits under the case-study grid and has
        to share its 832px column, not the hero's narrower 720px one. */}
    <div className={`${styles.casesWrap} ${styles.footerInner}`}>
      <div className={styles.links}>
        {user?.email && (
          <Link href={`mailto:${user.email}`} className="group">
            <FooterIcon src="/icons/email%20icon.svg" />
            <span className="group-hover:underline">{user.email}</span>
          </Link>
        )}
        {user?.linkedin_url && (
          <Link
            href={user.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <FooterIcon src="/icons/Linkedin%20icon.svg" />
            <span className="group-hover:underline">linkedin.com/fariszhr</span>
          </Link>
        )}
        {user?.cv_url && (
          <Link
            href={user.cv_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <FooterIcon src="/icons/cv%20download%20icon.svg" />
            <span className="group-hover:underline">Download CV</span>
          </Link>
        )}
      </div>
      <button
        type="button"
        className={`${styles.top} group`}
        onClick={onBackToTop}
      >
        <FooterIcon src="/icons/back%20to%20top.svg" />
        <span className="group-hover:underline">Back to top</span>
      </button>
    </div>
  </footer>
);

export default SiteFooter;
