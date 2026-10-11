/**
 * The hanging ID card on the landing page. 12:19 is the Figma card
 * (180 × 285 on desktop), close to a real ID-1 badge.
 */
export const CARD_ASPECT = 12 / 19;
export const CARD_EXPORT = { width: 1200, height: 1900 };
export const CARD_EXPORT_HINT = `Recommended ${CARD_EXPORT.width} × ${CARD_EXPORT.height} px (12:19 portrait)`;

/**
 * Insert a Cloudinary delivery transformation (e.g. "w_800,c_limit") into an
 * upload URL so the browser gets a right-sized, auto-format file. Non-Cloudinary
 * URLs are returned untouched.
 */
export const cldUrl = (url: string, transform: string) => {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }
  return url.replace("/upload/", `/upload/${transform}/`);
};

