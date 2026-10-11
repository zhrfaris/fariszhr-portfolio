/**
 * Motion for the Photo works page, on top of the existing grid (photo-grid)
 * and viewer (photo-viewer): the scatter of the grid around an opened photo,
 * its return, and the geometry the viewer's zoom needs. Everything works on
 * the existing elements through data attributes; durations and easings live
 * in CSS variables (--pw-*, landing.module.css).
 */

export type Rect = { x: number; y: number; w: number; h: number };

export const rectOf = (el: Element): Rect => {
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
};

/** A --pw-* duration in ms (they are 0.01ms under reduced motion). */
export const cssMs = (name: string) => {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return 0;
  return raw.endsWith("ms") ? n : n * 1000;
};

export const gridOf = () => document.querySelector<HTMLElement>("[data-photo-grid]");

/** The grid button of a photo, by its index. */
export const thumbOf = (index: number) =>
  document.querySelector<HTMLElement>(`[data-photo-grid] [data-photo-index="${index}"]`);

const viewportW = () => window.visualViewport?.width ?? window.innerWidth;
const viewportH = () => window.visualViewport?.height ?? window.innerHeight;

/**
 * Where an element at `rect` has to go to leave the viewport, moving away
 * from the focus point along the line through both centres, plus overshoot.
 * `ratio` is its distance from the focus over half the viewport diagonal.
 */
const pushOut = (rect: Rect, fx: number, fy: number, overshoot: number, fallback: number) => {
  const W = viewportW();
  const H = viewportH();
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  let dx = cx - fx;
  let dy = cy - fy;
  const dist = Math.hypot(dx, dy);
  if (dist < 2) {
    dx = Math.cos(fallback);
    dy = Math.sin(fallback);
  }
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  // the first viewport edge (past the element's own half size) the line meets
  const edgeX = ux >= 0 ? W + rect.w / 2 + overshoot : -rect.w / 2 - overshoot;
  const edgeY = uy >= 0 ? H + rect.h / 2 + overshoot : -rect.h / 2 - overshoot;
  const tx = Math.abs(ux) > 0.001 ? (edgeX - cx) / ux : Infinity;
  const ty = Math.abs(uy) > 0.001 ? (edgeY - cy) / uy : Infinity;
  const t = Math.min(tx > 0 ? tx : Infinity, ty > 0 ? ty : Infinity);
  return {
    x: ux * t,
    y: uy * t,
    ratio: Math.min(dist / Math.hypot(W / 2, H / 2), 1),
  };
};

const SCATTER_OPACITY = 0.42;

/**
 * Push every other photo in view out of the viewport, away from the centre
 * of the clicked one, and hide the clicked one (the viewer's copy of it takes
 * over). Photos nearer the focus fade and blur a little more.
 */
export const scatterGrid = (focusIndex: number) => {
  const grid = gridOf();
  const focus = thumbOf(focusIndex);
  if (!grid || !focus) return;
  const f = rectOf(focus);
  const fx = f.x + f.w / 2;
  const fy = f.y + f.h / 2;
  const overshoot = viewportW() < 640 ? 16 : 28;
  const H = viewportH();
  const W = viewportW();
  grid.setAttribute("data-motion", "open");
  focus.setAttribute("data-hidden", "");
  grid.querySelectorAll<HTMLElement>("[data-photo-index]").forEach((item, n) => {
    if (item === focus) return;
    const r = rectOf(item);
    if (r.y + r.h < -32 || r.y > H + 32 || r.x + r.w < -32 || r.x > W + 32) return;
    const m = pushOut(r, fx, fy, overshoot, n * 2.399963);
    item.style.transform = `translate3d(${m.x.toFixed(1)}px, ${m.y.toFixed(1)}px, 0) scale(0.98)`;
    item.style.opacity = (SCATTER_OPACITY + m.ratio * 0.08).toFixed(2);
    item.style.filter = `blur(${(1.4 - m.ratio * 0.4).toFixed(2)}px)`;
    item.setAttribute("data-scattered", "");
  });
};

/**
 * Bring the scattered photos back (close timing), and park the photos the
 * viewer is closing onto at their real place, still hidden, so their rects
 * can be read. Returns those rects, in `indices` order.
 */
export const gatherGrid = (indices: number[]): (Rect | null)[] => {
  const grid = gridOf();
  if (!grid) return indices.map(() => null);
  const targets = indices.map((i) => thumbOf(i));
  // Straight back to their real place (they're hidden): with no transition
  // at all, or the rect read below would still be the scattered one.
  targets.forEach((t) => {
    if (!t) return;
    t.setAttribute("data-hidden", "");
    t.style.transition = "none";
    clearMotion(t);
  });
  const rects = targets.map((t) => (t ? rectOf(t) : null));
  targets.forEach((t) => {
    if (!t) return;
    t.style.removeProperty("transition");
    t.setAttribute("data-handoff", "");
  });
  grid.setAttribute("data-motion", "close");
  grid.querySelectorAll<HTMLElement>("[data-scattered]").forEach(clearMotion);
  // A photo hidden at opening that the viewer has since moved off comes back
  // with the rest of the grid.
  grid.querySelectorAll<HTMLElement>("[data-hidden]").forEach((t) => {
    if (!targets.includes(t)) t.removeAttribute("data-hidden");
  });
  return rects;
};

const clearMotion = (item: HTMLElement) => {
  item.style.removeProperty("transform");
  item.style.removeProperty("opacity");
  item.style.removeProperty("filter");
  item.removeAttribute("data-scattered");
};

/** Show the hidden thumbnails again with no fade, and end the grid motion. */
export const revealGrid = () => {
  const grid = gridOf();
  if (!grid) return;
  // No transition at all for this one change: even a 0.01ms one still
  // starts from 0 on the next frame, the frame the viewer's copy is gone.
  const hidden = [...grid.querySelectorAll<HTMLElement>("[data-hidden]")];
  hidden.forEach((t) => {
    t.style.transition = "none";
    t.removeAttribute("data-hidden");
  });
  grid.querySelectorAll<HTMLElement>("[data-scattered]").forEach(clearMotion);
  void grid.offsetWidth;
  requestAnimationFrame(() => {
    hidden.forEach((t) => t.style.removeProperty("transition"));
    grid.querySelectorAll("[data-handoff]").forEach((t) => t.removeAttribute("data-handoff"));
    grid.removeAttribute("data-motion");
  });
};

/**
 * The viewer's flying copy of a photo is one image element, `baseW` wide at
 * scale 1, with the photo's own aspect ratio. To show the photo as
 * object-fit: cover in `box` (a thumbnail, or its place on a zine page), the
 * copy is scaled evenly to cover the box and clipped back to it; the clip is
 * in the copy's own pixels, so it is divided by the scale.
 */
export const coverPose = (box: Rect, aspect: number, baseW: number) => {
  const w = Math.max(box.w, box.h * aspect);
  const h = w / aspect;
  const k = w / baseW;
  const x = box.x + (box.w - w) / 2;
  const y = box.y + (box.h - h) / 2;
  const ix = ((w - box.w) / 2 / k).toFixed(2);
  const iy = ((h - box.h) / 2 / k).toFixed(2);
  return {
    transform: `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${k.toFixed(5)})`,
    clip: `inset(${iy}px ${ix}px ${iy}px ${ix}px)`,
  };
};
