import styles from "./zine.module.css";
import { zineContent } from "@/content/home";

/**
 * Status pill, not a countdown and not an action — a red dot and a label that
 * invert solid dark on hover. Nothing happens on click, so it is a span rather
 * than a button: there is no keyboard affordance to promise.
 *
 * The pill sits tilted on a second sheet tilted less, so the two splay apart
 * into a stack of paper. The sheet is a sibling rather than a pseudo-element
 * because the pill's own rotation makes it a stacking context, inside which a
 * negative-z child would paint over the pill's fill instead of under it.
 */
const SoonBadge = () => (
  <span className={styles.soonBadgeStack}>
    <span className={styles.soonBadgeSheet} aria-hidden />
    <span className={styles.soonBadge}>
      <i className={styles.pulse} aria-hidden />
      {/* one flex item, so the label and the bold half are separated by a real
          word space rather than by the flex gap, which is there to sit the dot
          off the text */}
      <span>
        {zineContent.badgeLabel}{" "}
        <b className={styles.soonBadgeEmphasis}>{zineContent.badgeEmphasis}</b>
      </span>
    </span>
  </span>
);

export default SoonBadge;
