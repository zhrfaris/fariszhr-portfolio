import styles from "./landing.module.css";

/** The mode's intro paragraph. Line breaks typed in the dashboard are kept. */
const LandingIntro = ({ text }: { text?: string | null }) =>
  text?.trim() ? <p className={styles.intro}>{text.trim()}</p> : null;

export const LandingContent = ({ children }: { children: React.ReactNode }) => (
  <div className={styles.content}>{children}</div>
);

export default LandingIntro;
