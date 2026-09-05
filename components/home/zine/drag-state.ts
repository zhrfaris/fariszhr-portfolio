/**
 * The book sets this while a page is being pulled, so a drag inside the zine
 * never trips the scroll snap. Module state rather than React state on purpose:
 * it is read inside a scroll handler on every frame and must never re-render.
 */
let dragging = false;

export const setZineDragging = (v: boolean) => {
  dragging = v;
};

export const isZineDragging = () => dragging;
