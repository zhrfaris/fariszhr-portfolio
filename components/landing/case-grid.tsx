import homeStyles from "@/components/home/home.module.css";
import ShowcaseSection from "@/components/home/showcase-section";
import styles from "./landing.module.css";
import CaseEntrance from "./case-entrance";
import { LandingPost } from "./data";

/**
 * Case studies on "/": the previous home page's own section, unchanged —
 * ShowcaseSection inside the same `caseStack` context, so the cards keep
 * exactly the grid, gap, breakpoints and per-card styling they had (the deck
 * animation is simply never started, which is its at-rest state).
 */
const CaseGrid = ({ posts }: { posts: LandingPost[] }) => {
  if (posts.length === 0) {
    return (
      <p className={styles.empty}>
        Case studies are on their way. Check back soon.
      </p>
    );
  }

  return (
    <CaseEntrance className={styles.cases}>
      <div className={homeStyles.caseStack} data-stack-ready="">
        <ShowcaseSection posts={posts} />
      </div>
    </CaseEntrance>
  );
};

export default CaseGrid;
