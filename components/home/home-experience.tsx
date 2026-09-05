"use client";

import { useRef, type ReactNode } from "react";

import styles from "./home.module.css";
import { casesContent, heroContent, zineContent } from "@/content/home";
import { useHomeChoreography } from "./use-home-choreography";
import CaseStack, { type CaseStackHandle } from "./case-stack";
import ZineBook from "./zine/zine-book";
import SoonBadge from "./zine/soon-badge";
import SiteFooter from "./site-footer";
import { User } from "@/actions/user/get/type";

/**
 * The pinned hero and the white surface that rises over it.
 *
 * `identity` and `cases` arrive as server-rendered slots — the case-study grid
 * in particular is untouched here, it is only positioned and animated.
 */
const HomeExperience = ({
  user,
  identity,
  cases,
}: {
  user?: User;
  identity: ReactNode;
  cases: ReactNode;
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const zineRef = useRef<HTMLDivElement>(null);
  const footRef = useRef<HTMLDivElement>(null);
  const casesRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<CaseStackHandle>(null);
  const casesHeadRef = useRef<HTMLDivElement>(null);

  const { scrollToTop, snapToGrid } = useHomeChoreography({
    rootRef,
    trackRef,
    heroRef,
    headerRef,
    zineRef,
    footRef,
    casesRef,
    innerRef,
    // the deck is dealt out by the same scroll frame that raises the surface
    onProgress: (s) => stackRef.current?.paint(s),
  });

  return (
    <div className={styles.root} ref={rootRef}>
      <div className={styles.heroTrack} ref={trackRef}>
        <section className={styles.hero} ref={heroRef}>
          <header className={styles.siteHeader} ref={headerRef}>
            <div className={`${styles.wrap} ${styles.headerInner}`}>
              {identity}
              <div className={styles.blurb}>
                <h2>{heroContent.title}</h2>
                <p>{heroContent.description}</p>
              </div>
            </div>
          </header>

          <div className={styles.wrap}>
            <ZineBook ref={zineRef} />

            <div className={styles.heroFoot} ref={footRef}>
              <div>
                <h3>{zineContent.title}</h3>
                <p>{zineContent.description}</p>
              </div>
              <div className={styles.ctaCol}>
                <SoonBadge />
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className={styles.cases} ref={casesRef}>
        <div className={styles.casesInner} ref={innerRef}>
          <div className={styles.wrap}>
            {/* hidden while the deck is stacked; the deck fades it up on the
                same ramp as the card contents */}
            <div className={styles.casesHead} ref={casesHeadRef}>
              <h2>{casesContent.title}</h2>
              <p>{casesContent.description}</p>
            </div>
            <CaseStack
              ref={stackRef}
              onJumpToGrid={snapToGrid}
              headingRef={casesHeadRef}
            >
              {cases}
            </CaseStack>
          </div>

          <SiteFooter user={user} onBackToTop={scrollToTop} />
        </div>
      </section>
    </div>
  );
};

export default HomeExperience;
