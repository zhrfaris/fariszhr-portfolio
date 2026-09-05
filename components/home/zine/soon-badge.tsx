import styles from "./zine.module.css";
import { zineContent } from "@/content/home";

/**
 * Status pill, not a countdown and not an action — a red dot and a label that
 * invert solid dark on hover. Nothing happens on click, so it is a span rather
 * than a button: there is no keyboard affordance to promise.
 */
const SoonBadge = () => (
  <span className={styles.soonBadge}>
    <i className={styles.pulse} aria-hidden />
    {zineContent.badgeLabel}
  </span>
);

export default SoonBadge;
