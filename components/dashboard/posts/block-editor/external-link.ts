import Link from "@tiptap/extension-link";

/** Hosts of the portfolio itself; links to them stay in the same tab. */
const SITE_HOSTS = [
  "fariszhr.studio",
  "www.fariszhr.studio",
  "farisazhar.com",
  "www.farisazhar.com",
];

/** True for absolute http(s) links to another domain. Relative paths,
 * anchors, mailto and links to this site are internal. */
export const isExternalHref = (href?: string | null): boolean => {
  if (!href || !/^https?:\/\//i.test(href)) return false;
  try {
    const host = new URL(href).host.toLowerCase();
    const current =
      typeof window !== "undefined" ? window.location.host.toLowerCase() : "";
    return host !== current && !SITE_HOSTS.includes(host);
  } catch {
    return false;
  }
};

/**
 * Link mark whose target/rel are derived from the href on every render, so
 * links typed, pasted or loaded from older content all follow one rule: only
 * external links open in a new tab.
 */
export const ExternalAwareLink = Link.extend({
  renderHTML(props) {
    const spec = this.parent?.(props) as [string, Record<string, unknown>, 0];
    const external = isExternalHref(props.HTMLAttributes.href);
    spec[1] = {
      ...spec[1],
      // null attributes are omitted by ProseMirror's serializer.
      target: external ? "_blank" : null,
      rel: external ? "noopener noreferrer nofollow" : null,
    };
    return spec;
  },
});
