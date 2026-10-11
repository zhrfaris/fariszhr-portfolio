import { User } from "@/actions/user/get/type";
import styles from "./landing.module.css";

/** public/icons SVGs drawn as masks so they take the link colour. */
const FooterIcon = ({ src }: { src: string }) => (
  <span
    aria-hidden
    className={styles.footerIcon}
    style={{ "--icon": `url("${src}")` } as React.CSSProperties}
  />
);

/** "https://www.linkedin.com/in/fariszhr/" → "linkedin.com/fariszhr" */
const linkedInLabel = (url: string) => {
  try {
    const { hostname, pathname } = new URL(url);
    const handle = pathname.split("/").filter(Boolean).pop();
    const host = hostname.replace(/^www\./, "");
    return handle ? `${host}/${handle}` : host;
  } catch {
    return url;
  }
};

const LandingFooter = ({ user }: { user?: User }) => {
  if (!user?.email && !user?.linkedin_url && !user?.cv_url) return null;

  return (
    <footer className={styles.footer}>
      <div className={styles.footerLinks}>
        {user.email && (
          <a href={`mailto:${user.email}`}>
            <FooterIcon src="/icons/email%20icon.svg" />
            <span>{user.email}</span>
          </a>
        )}
        {user.linkedin_url && (
          <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer">
            <FooterIcon src="/icons/Linkedin%20icon.svg" />
            <span>{linkedInLabel(user.linkedin_url)}</span>
          </a>
        )}
      </div>
      {user.cv_url && (
        <a href={user.cv_url} target="_blank" rel="noopener noreferrer">
          <FooterIcon src="/icons/cv%20download%20icon.svg" />
          <span>Download CV</span>
        </a>
      )}
    </footer>
  );
};

export default LandingFooter;
