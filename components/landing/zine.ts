/**
 * Lays the photo set out as zine pages (fixed 4:3):
 * - a landscape (or square) photo gets a page of its own;
 * - each portrait pairs with the next unused portrait in the order, and the
 *   pair takes the place of the first one (the second leaves its own spot);
 * - an odd portrait out goes to the very end as a page of its own.
 * Orientation comes from each photo's real width/height.
 */

export type ZinePage =
  | { kind: "single"; photos: [number] }
  | { kind: "pair"; photos: [number, number] }
  | { kind: "solo"; photos: [number] };

export interface Zine {
  pages: ZinePage[];
  /** For each photo index, the page it sits on. */
  pageOf: number[];
}

type Sized = { width: number; height: number };

export const isPortrait = ({ width, height }: Sized) =>
  width > 0 && height > 0 && height > width;

export const buildZine = (photos: Sized[]): Zine => {
  const pages: ZinePage[] = [];
  const used = new Set<number>();
  let leftover: number | null = null;

  photos.forEach((photo, i) => {
    if (used.has(i)) return;
    used.add(i);
    if (!isPortrait(photo)) {
      pages.push({ kind: "single", photos: [i] });
      return;
    }
    let partner = -1;
    for (let j = i + 1; j < photos.length; j++) {
      if (!used.has(j) && isPortrait(photos[j])) {
        partner = j;
        break;
      }
    }
    if (partner === -1) {
      leftover = i;
      return;
    }
    used.add(partner);
    pages.push({ kind: "pair", photos: [i, partner] });
  });

  if (leftover !== null) pages.push({ kind: "solo", photos: [leftover] });

  const pageOf: number[] = new Array(photos.length).fill(0);
  pages.forEach((page, p) => page.photos.forEach((i) => (pageOf[i] = p)));
  return { pages, pageOf };
};
