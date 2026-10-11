"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useLenis } from "lenis/react";
import { BookOpen, Image as ImageIcon } from "lucide-react";

import { PublicGalleryPhoto } from "@/actions/gallery/get/types";
import MainButton from "@/components/common/main-button";
import ZineBook from "@/components/home/zine/zine-book";
import zineStyles from "@/components/home/zine/zine.module.css";
import type { PageSource } from "@/components/home/zine/page-textures";
import { cldUrl } from "@/lib/landing";
import ModeTabs from "./mode-tabs";
import styles from "./photo-viewer.module.css";
import { buildZine, type Zine } from "./zine";
import { buildFaces, FACE_W, faceSource } from "./zine-faces";
import {
  coverPose,
  cssMs,
  gatherGrid,
  rectOf,
  revealGrid,
  scatterGrid,
  thumbOf,
  type Rect,
} from "./photo-motion";

type View = "magazine" | "gallery";

const large = (url: string) => cldUrl(url, "w_2000,h_2000,c_limit,q_auto,f_auto");

/** The Gallery print's image (the grid warms it on pointerdown). */
export const printSource = (photo: PublicGalleryPhoto) => large(photo.image.img_url);

/**
 * Full-screen photo viewer for the Photo works grid, with two views:
 * - Magazine: the set laid out as spreads (see zine.ts) in the home page's
 *   zine book (components/home/zine), page flip and all;
 * - Gallery: one photo at a time, in grid order, as a white-bordered print.
 * Opens on Gallery, on the clicked photo; the book is brought up quietly
 * behind it, so Magazine is ready when it's asked for. Esc or a click on
 * the dark background closes it; ←/→ step; switching views keeps your place.
 * Switching crossfades the two views in place (see Layer), in step with the
 * switcher's thumb.
 */
const PhotoViewer = ({
  photos,
  openAt,
  onClose,
}: {
  photos: PublicGalleryPhoto[];
  /** Index of the clicked photo, or null when closed. */
  openAt: number | null;
  onClose: () => void;
}) => {
  const zine = useMemo(
    () =>
      buildZine(
        photos.map((p) => ({ width: p.image.img_width, height: p.image.img_height }))
      ),
    [photos]
  );
  if (openAt === null) return null;
  // Keyed on the clicked photo: every opening starts fresh, already on the
  // right page (no frame of the previous state).
  return (
    <OpenViewer
      key={openAt}
      photos={photos}
      zine={zine}
      openAt={openAt}
      onClose={onClose}
    />
  );
};

const OpenViewer = ({
  photos,
  zine,
  openAt,
  onClose,
}: {
  photos: PublicGalleryPhoto[];
  zine: Zine;
  openAt: number;
  onClose: () => void;
}) => {
  const lenis = useLenis();

  /** Phones (the viewer's own 640px breakpoint) get Gallery only. */
  const isPhone = useIsPhone();
  // Opens on Gallery, at the clicked photo.
  /** The switcher's choice. */
  const [view, setView] = useState<View>("gallery");
  /** The view in front — the one the arrows, keys and counter follow. */
  const [shown, setShown] = useState<View>("gallery");
  const [page, setPage] = useState(() => zine.pageOf[openAt] ?? 0);
  const [photo, setPhoto] = useState(openAt);

  /* Each view is a layer that stays mounted until it has faded out. The
     book comes up hidden behind Gallery once the opening zoom has landed
     (see the motion block below), so its WebGL setup never holds up the
     zoom, and Magazine is usually drawn before it's asked for. */
  const [bookMounted, setBookMounted] = useState(false);
  const [printMounted, setPrintMounted] = useState(true);
  /** The mounted book has drawn its open spread. */
  const bookReady = useRef(false);
  /** Nothing has been switched yet: the print that opens the viewer is just
   * there, with no fade. */
  const switched = useRef(false);
  const viewRef = useRef(view);
  viewRef.current = view;
  const shownRef = useRef(shown);
  shownRef.current = shown;
  /** A book mount waiting for the switcher's thumb to land (see switchView). */
  const mountTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(mountTimer.current), []);

  // Radix locks native scroll (and keeps the position); Lenis drives its own
  // smooth scroll, so pause it too while the viewer is up.
  useEffect(() => {
    lenis?.stop();
    return () => lenis?.start();
  }, [lenis]);

  const counts = { magazine: zine.pages.length, gallery: photos.length };
  const indices = { magazine: page, gallery: photo };
  const count = counts[shown];
  const index = indices[shown];
  /** The book's own animated turn (it reports the new spread when it settles). */
  const turnRef = useRef<((dir: 1 | -1) => void) | null>(null);
  // Magazine turns the page in the book; Gallery steps with functional
  // updates, so quick repeats (a held arrow key) all count. Held while a
  // book that's coming in gets ready, so it opens where the print was.
  const step = (delta: 1 | -1) => {
    if (view !== shown) return;
    // Not mid-zoom, nor while the page's photos stand in for the book.
    if (flying.current || arrivingRef.current) return;
    if (shown === "magazine") {
      turnRef.current?.(delta);
      return;
    }
    setPhoto((i) => Math.min(count - 1, Math.max(0, i + delta)));
  };

  /* Called as the switcher's thumb sets off (changeOnSelect). Gallery comes
     in at once. So does Magazine when the book behind is drawn on the right
     page (the usual case); if not, the page's photo(s) stand in, in place,
     until it is. A switch back mid-fade just turns the layers round. */
  const switchView = (next: View) => {
    if (next === view) return;
    switched.current = true;
    setView(next);
    clearTimeout(mountTimer.current);
    if (next === "gallery") {
      endArrival();
      setPhoto(zine.pages[page]?.photos[0] ?? 0);
      setPrintMounted(true);
      setShown("gallery");
      return;
    }
    const at = zine.pageOf[photo] ?? 0;
    setPage(at);
    if (bookMounted) {
      if (at !== bookSpread.current) {
        bookReady.current = false;
        jumpRef.current?.(at);
      }
    } else {
      bookReady.current = false;
      // Bringing a book up blocks the main thread for a while (WebGL setup),
      // so it waits for the thumb to land rather than freezing it mid-travel.
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      mountTimer.current = setTimeout(
        () => setBookMounted(true),
        reduce ? 0 : BOOK_MOUNT_DELAY_MS
      );
    }
    setShown("magazine");
    if (!bookReady.current) standIn(at);
  };

  // Narrowed to a phone while in Magazine: back to Gallery (no switcher there).
  useEffect(() => {
    if (isPhone && view === "magazine") switchView("gallery");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPhone]);

  const onBookReady = () => {
    bookReady.current = true;
    maybeHandOff();
  };

  /** The spread the book has open (it reports each one as it settles). */
  const bookSpread = useRef(-1);
  const jumpRef = useRef<((spread: number) => void) | null>(null);
  // While Gallery is up, keep the hidden book on the photo's page — after a
  // short rest, so stepping through prints doesn't redraw it every time.
  useEffect(() => {
    if (shown !== "gallery" || !bookMounted) return;
    const at = zine.pageOf[photo] ?? 0;
    if (at === bookSpread.current) return;
    const timer = setTimeout(() => {
      bookReady.current = false;
      jumpRef.current?.(at);
    }, 300);
    return () => clearTimeout(timer);
  }, [shown, bookMounted, photo, zine]);

  // Warm the neighbouring prints so stepping feels instant, and in Magazine
  // the print a switch to Gallery would show (the book loads the pages
  // around the open spread itself).
  useEffect(() => {
    const warm = shown === "gallery" ? [photo - 1, photo + 1] : [zine.pages[page]?.photos[0]];
    warm.forEach((i) => {
      const p = i === undefined ? undefined : photos[i];
      if (p) new Image().src = large(p.image.img_url);
    });
  }, [shown, photo, page, photos, zine]);

  const contentRef = useRef<HTMLDivElement | null>(null);
  /* The zine's white margin matches the Gallery print border on screen
     (--print-border). The pages are canvas textures, so the margin is turned
     into texture pixels by the book's rendered page width, and the faces are
     redrawn (a new set, which rebuilds the book on the open page) whenever
     that comes out different — a resize or the phone breakpoint. A callback
     ref, because the dialog mounts its content a commit after this component:
     it measures as soon as the book is in the DOM, before any page is drawn
     (a face reads the margin once its photo has loaded). */
  const margin = useRef(0);
  const [marginVersion, setMarginVersion] = useState(0);
  const stopWatching = useRef<() => void>();
  const bookEl = useRef<HTMLDivElement | null>(null);
  const bookRef = useCallback((book: HTMLDivElement | null) => {
    bookEl.current = book;
    stopWatching.current?.();
    stopWatching.current = undefined;
    if (!book) return;
    const measure = () => {
      const border = parseFloat(getComputedStyle(book).getPropertyValue("--print-border")) || 0;
      // Layout width, not the drawn one: the layer around it scales while it fades.
      const pageWidth = book.offsetWidth / 2;
      return pageWidth > 0 ? Math.round((border * FACE_W) / pageWidth) : margin.current;
    };
    margin.current = measure();
    let timer: ReturnType<typeof setTimeout>;
    const observer = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const next = measure();
        if (next === margin.current) return;
        margin.current = next;
        setMarginVersion((v) => v + 1);
      }, 150);
    });
    observer.observe(book);
    stopWatching.current = () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);
  const faces = useMemo<PageSource[]>(
    () => buildFaces(photos, zine, () => margin.current),
    // marginVersion: a new set of faces is what makes the book redraw them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [photos, zine, marginVersion]
  );

  const swipe = useRef<{ x: number; y: number; id: number } | null>(null);
  /** Whether the current press started on the dark background. Only a press
   * that starts and ends there closes the viewer, so a swipe or drag that
   * begins on the photo and is released over the background never does. */
  const pressOnBackground = useRef(false);

  // A layer that unmounts with focus inside it would drop focus out of the
  // viewer (and ←/→ with it): take it back.
  useEffect(() => {
    const content = contentRef.current;
    if (content && !content.contains(document.activeElement)) content.focus();
  }, [bookMounted, printMounted]);

  /* ---------- zoom in / out (motion over the existing views) ----------
     Opening: the Gallery print itself flies from the clicked thumbnail to its
     place while the grid scatters and the backdrop fades in; once it lands,
     the book comes up hidden behind it. Closing reverses it, to the
     thumbnails of whatever is shown then: the print itself, or copies of the
     page's photo(s). Copies also stand in for a book that isn't drawn yet
     when Magazine is chosen. Timings: --pw-* (app/globals.css). */
  const [phase, setPhase] = useState<"start" | "open" | "closing">("start");
  const [arriving, setArriving] = useState<"" | "wait" | "handoff">("");
  const arrivingRef = useRef(arriving);
  arrivingRef.current = arriving;
  const ghosts = useRef<{ index: number; el: HTMLImageElement; aspect: number; baseW: number }[]>([]);
  /** The opening zoom of the print is under way. */
  const flying = useRef(false);
  /** The print's own rect (untransformed), for a close during that zoom. */
  const printBase = useRef<Rect | null>(null);
  const closing = useRef(false);
  /** The thumbnail focus goes back to once the viewer has closed onto it. */
  const returnTo = useRef(openAt);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));

  const aspectOf = (i: number) => {
    const { img_width: w, img_height: h } = photos[i].image;
    return w && h ? w / h : 1.5;
  };

  /** The book's paper on screen, and its margin in texture pixels. Before the
   * book is up, worked out the way it lays itself out: a 1.5:1 spread, as
   * wide as the content box, centred in it. */
  const paper = (): { s: Rect; marginTex: number } | null => {
    const sheet = bookEl.current?.querySelector("[data-zine-stage]")?.firstElementChild;
    if (sheet) return { s: rectOf(sheet), marginTex: margin.current };
    const box = contentRef.current?.querySelector(`.${styles.content}`);
    if (!box) return null;
    const c = rectOf(box);
    const h = c.w / 1.5;
    const border = parseFloat(getComputedStyle(box).getPropertyValue("--print-border")) || 0;
    return {
      s: { x: c.x, y: c.y + (c.h - h) / 2, w: c.w, h },
      marginTex: Math.round((border * FACE_W) / (c.w / 2)),
    };
  };

  /** Where each photo of a zine page sits on screen (inside its margin). */
  const pageBoxes = (pageIndex: number): { index: number; box: Rect }[] => {
    const entry = zine.pages[pageIndex];
    const p = paper();
    if (!entry || !p) return [];
    const { s } = p;
    const pageW = s.w / 2;
    const m = (p.marginTex * pageW) / FACE_W;
    const box = (x: number, w: number) => ({ x, y: s.y + m, w, h: s.h - 2 * m });
    if (entry.kind === "single") {
      return [{ index: entry.photos[0], box: box(s.x + m, s.w - 2 * m) }];
    }
    return entry.photos.map((index, side) => ({
      index,
      box: box(s.x + side * pageW + m, pageW - 2 * m),
    }));
  };

  const makeGhost = (index: number, box: Rect, from: Rect | null) => {
    const content = contentRef.current;
    if (!content) return null;
    const aspect = aspectOf(index);
    const baseW = Math.max(box.w, box.h * aspect);
    const el = document.createElement("img");
    el.className = styles.ghost;
    el.alt = "";
    el.setAttribute("aria-hidden", "true");
    el.draggable = false;
    el.style.width = `${baseW}px`;
    el.style.height = `${baseW / aspect}px`;
    // Plain #f5f5f5 until the full image is in (no soft preview).
    el.style.background = "#f5f5f5";
    const settle = () => el.style.removeProperty("background");
    el.addEventListener("load", settle, { once: true });
    el.addEventListener("error", settle, { once: true });
    el.src = faceSource(photos[index]);
    const start = coverPose(from ?? box, aspect, baseW);
    el.style.transition = "none";
    el.style.transform = start.transform;
    el.style.clipPath = start.clip;
    content.appendChild(el);
    void el.offsetWidth;
    el.style.removeProperty("transition");
    const ghost = { index, el, aspect, baseW };
    ghosts.current.push(ghost);
    return ghost;
  };

  const flyTo = (ghost: (typeof ghosts.current)[number], box: Rect) => {
    const pose = coverPose(box, ghost.aspect, ghost.baseW);
    ghost.el.style.transform = pose.transform;
    ghost.el.style.clipPath = pose.clip;
  };

  const dropGhosts = () => {
    ghosts.current.forEach((g) => g.el.remove());
    ghosts.current = [];
  };

  /** The page's photos, in place, while the book draws (Magazine chosen
   * before it was ready): they fade in with the switch. */
  const standIn = (pageIndex: number) => {
    dropGhosts();
    pageBoxes(pageIndex).forEach(({ index, box }) => {
      const ghost = makeGhost(index, box, null);
      if (!ghost) return;
      ghost.el.style.opacity = "0";
      void ghost.el.offsetWidth;
      ghost.el.style.transition = "opacity var(--switch-time) var(--switch-ease)";
      ghost.el.style.opacity = "1";
    });
    setArriving("wait");
  };

  /** The book has drawn: show it under the stand-ins, then let them go. */
  const maybeHandOff = () => {
    if (closing.current || arrivingRef.current !== "wait") return;
    if (!bookReady.current) return;
    setArriving("handoff");
    later(() => {
      if (closing.current) return;
      dropGhosts();
      setArriving("");
    }, cssMs("--pw-handoff"));
  };

  /** Cut the arrival short (a turn or a switch before the book took over). */
  const endArrival = () => {
    if (arrivingRef.current === "") return;
    dropGhosts();
    setArriving("");
  };

  // The dialog mounts its content a commit after this component.
  const [contentEl, setContentEl] = useState<HTMLDivElement | null>(null);
  const setContent = useCallback((el: HTMLDivElement | null) => {
    contentRef.current = el;
    setContentEl(el);
  }, []);

  const printImg = () =>
    contentRef.current?.querySelector<HTMLImageElement>(`.${styles.stage}[data-on] img`) ?? null;

  /** Where the print sits once its image is in: contained in the stage
   * inside its border, never past the image's own size (2000px long side),
   * centred — as .print img lays it out. Measured when it's already loaded;
   * before that the <img> has no size of its own to measure. */
  const printRect = (img: HTMLImageElement, i: number): Rect => {
    if (img.complete && img.naturalWidth > 0) return rectOf(img);
    const stage = img.closest(`.${styles.stage}`) ?? img;
    const s = rectOf(stage);
    const b = parseFloat(getComputedStyle(img).borderTopWidth) || 0;
    const { img_width: ow, img_height: oh } = photos[i].image;
    const ratio = ow && oh ? ow / oh : 1.5;
    const natural = ow && oh ? Math.min(ow, (ow * 2000) / Math.max(ow, oh)) : Infinity;
    const w = Math.min(natural, s.w - 2 * b, (s.h - 2 * b) * ratio);
    const h = w / ratio;
    return {
      x: s.x + (s.w - w - 2 * b) / 2,
      y: s.y + (s.h - h - 2 * b) / 2,
      w: w + 2 * b,
      h: h + 2 * b,
    };
  };

  /** Bring the book up behind Gallery once the viewer has been left alone
   * for a moment: its WebGL setup holds the main thread for a while, so it
   * waits for a pause in taps and keys rather than landing on one. (Choosing
   * Magazine first brings it up at once, behind its stand-ins.) */
  const stopWarm = useRef<() => void>();
  useEffect(() => () => stopWarm.current?.(), []);
  const warmBook = () => {
    const content = contentRef.current;
    if (!content || isPhoneNow()) return;
    let timer: ReturnType<typeof setTimeout>;
    const stop = () => {
      clearTimeout(timer);
      content.removeEventListener("pointerdown", arm, true);
      content.removeEventListener("keydown", arm, true);
    };
    const go = () => {
      stop();
      const mount = () => !closing.current && setBookMounted(true);
      if ("requestIdleCallback" in window) window.requestIdleCallback(mount, { timeout: 500 });
      else mount();
    };
    function arm() {
      clearTimeout(timer);
      timer = setTimeout(go, BOOK_IDLE_MS);
    }
    content.addEventListener("pointerdown", arm, true);
    content.addEventListener("keydown", arm, true);
    stopWarm.current = stop;
    arm();
  };

  useLayoutEffect(() => {
    if (!contentEl || phase !== "start") return;
    const thumb = thumbOf(openAt);
    const img = printImg();
    scatterGrid(openAt);
    if (thumb && img) {
      const from = rectOf(thumb);
      const to = printRect(img, openAt);
      printBase.current = to;
      // Not loaded yet: held at the size it will have (so the zoom lands
      // right), plain #f5f5f5 inside its border until the image is in.
      if (!(img.complete && img.naturalWidth > 0)) {
        img.style.width = `${to.w}px`;
        img.style.height = `${to.h}px`;
        img.style.background = "#f5f5f5";
        const settle = () => {
          img.style.removeProperty("width");
          img.style.removeProperty("height");
          img.style.removeProperty("background");
        };
        img.addEventListener("load", settle, { once: true });
        img.addEventListener("error", settle, { once: true });
      }
      img.style.transformOrigin = "0 0";
      img.style.transition = "none";
      img.style.transform = `translate3d(${from.x - to.x}px, ${from.y - to.y}px, 0) scale(${
        from.w / to.w
      }, ${from.h / to.h})`;
      void img.offsetWidth;
      img.style.transition = "transform var(--pw-zoom) var(--pw-ease-in-out)";
      img.style.removeProperty("transform");
      flying.current = true;
      // Landed: the print is simply itself again; the book starts behind it.
      // The timer only backs up transitionend.
      const landed = () => {
        if (!flying.current) return;
        flying.current = false;
        if (closing.current) return;
        img.style.removeProperty("transition");
        img.style.removeProperty("transform-origin");
        warmBook();
      };
      img.addEventListener("transitionend", (e) => {
        if (e.propertyName === "transform") landed();
      });
      later(landed, cssMs("--pw-zoom") + 1000);
    } else {
      warmBook();
    }
    // the start state (no backdrop) has to be styled before it changes
    void contentEl.offsetWidth;
    setPhase("open");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentEl]);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const closeMs = cssMs("--pw-close");
    const inGallery = shownRef.current === "gallery";
    const indices = inGallery ? [photo] : (zine.pages[page]?.photos ?? []);
    returnTo.current = indices[0] ?? openAt;
    const thumbs = gatherGrid([...indices]);

    if (inGallery) {
      dropGhosts();
      const img = printImg();
      const to = thumbs[0];
      if (img && to) {
        // Mid-zoom the print is transformed; its own rect is the one kept.
        const from = (flying.current && printBase.current) || rectOf(img);
        img.style.transformOrigin = "0 0";
        img.style.transition = `transform ${closeMs}ms var(--pw-ease-out)`;
        img.style.transform = `translate3d(${to.x - from.x}px, ${to.y - from.y}px, 0) scale(${
          to.w / from.w
        }, ${to.h / from.h})`;
      }
    } else {
      // Copies already up (standing in) carry on from where they are;
      // otherwise they start exactly over the page's photos, and the book
      // goes in the same frame.
      if (ghosts.current.length === 0) {
        pageBoxes(page).forEach(({ index, box }) => makeGhost(index, box, null));
      }
      ghosts.current.forEach((g) => {
        const to = thumbs[indices.indexOf(g.index)];
        if (to) flyTo(g, to);
        else g.el.style.opacity = "0";
      });
    }
    setPhase("closing");
    later(() => {
      revealGrid();
      onClose();
    }, closeMs);
  };

  const label = (v: View) => (v === "magazine" ? "Page" : "Photo");
  const counterLabel = label(shown);

  return (
    <Dialog.Root open onOpenChange={(next) => !next && close()}>
      <Dialog.Portal>
        <Dialog.Content
          data-lanyard-ignore
          aria-describedby={undefined}
          className={styles.viewer}
          data-phase={phase}
          data-arriving={arriving || undefined}
          // Focus the viewer itself (not the first switcher tab), so ←/→
          // step through pages straight away.
          tabIndex={-1}
          ref={setContent}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            thumbOf(returnTo.current)?.focus({ preventScroll: true });
          }}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            contentRef.current?.focus();
          }}
          onKeyDown={(e) => {
            // The switcher uses ←/→ itself when it has focus.
            if (e.defaultPrevented) return;
            if (e.key === "ArrowRight") step(1);
            if (e.key === "ArrowLeft") step(-1);
          }}
          onPointerDown={(e) => {
            pressOnBackground.current = isBackground(e);
          }}
          onClick={(e) => {
            // Only the dark background closes (not the book, print, switcher
            // or nav).
            if (pressOnBackground.current && isBackground(e)) close();
            pressOnBackground.current = false;
          }}
        >
          <VisuallyHidden>
            <Dialog.Title>
              {counterLabel} {index + 1} of {count}
            </Dialog.Title>
          </VisuallyHidden>

          {/* Phones get Gallery only: no switcher, no book. */}
          {!isPhone && (
            <ModeTabs
              aria-label="Photo view"
              arrowKeys={false}
              changeOnSelect
              value={view}
              onChange={switchView}
              items={[
                {
                  value: "gallery",
                  label: "Gallery",
                  icon: <ImageIcon strokeWidth={1.75} />,
                },
                {
                  value: "magazine",
                  label: "Magazine",
                  icon: <BookOpen strokeWidth={1.75} />,
                },
              ]}
            />
          )}

          {/* Both views stacked in one box, sized for the larger of the two,
              so nothing around them moves as they swap. The box and the
              book's layer count as background (data-backdrop). */}
          <div className={styles.content} data-backdrop="">
            {bookMounted && (
              <Layer
                className={`${styles.layer} ${styles.bookLayer}`}
                active={shown === "magazine"}
                instant={false}
                // Kept (hidden, paused) once up, so going back to Magazine
                // is instant; it goes when the viewer closes.
                onHidden={() => {}}
                data-backdrop=""
              >
                {/* The home page's zine book, fed the photo spreads. Dragging
                    a page (or a swipe on touch) turns it, as on the home page. */}
                <ZineBook
                  ref={bookRef}
                  className={styles.book}
                  pages={faces}
                  loop={false}
                  initialSpread={page}
                  showNav={false}
                  onSpreadChange={(spread) => {
                    bookSpread.current = spread;
                    setPage(spread);
                  }}
                  turnRef={turnRef}
                  jumpRef={jumpRef}
                  // Hidden behind Gallery it holds its last frame.
                  paused={shown !== "magazine"}
                  onReady={onBookReady}
                />
              </Layer>
            )}
            {printMounted && (
              <Layer
                className={`${styles.layer} ${styles.stage}`}
                active={shown === "gallery"}
                instant={!switched.current}
                onHidden={() => setPrintMounted(false)}
                onPointerDown={(e) => {
                  swipe.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
                }}
                onPointerUp={(e) => {
                  const start = swipe.current;
                  swipe.current = null;
                  if (!start || start.id !== e.pointerId) return;
                  const dx = e.clientX - start.x;
                  const dy = e.clientY - start.y;
                  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) {
                    step(dx < 0 ? 1 : -1);
                  }
                }}
              >
                <GalleryPrint key={`photo-${photo}`} photo={photos[photo]} />
              </Layer>
            )}
          </div>

          {/* MainButton with the zine's chevrons: the same skeuomorphic
              arrows the zine book uses beside its pages. */}
          <div className={styles.nav}>
            <MainButton
              rounded
              size="icon"
              type="button"
              className={styles.navButton}
              onClick={() => step(-1)}
              disabled={index === 0}
              aria-label={`Previous ${counterLabel.toLowerCase()}`}
            >
              <span className={`${zineStyles.navIcon} ${zineStyles.navIconPrev}`} aria-hidden />
            </MainButton>
            {/* Both labels share one cell and crossfade with the views. */}
            <p className={styles.counter} aria-hidden>
              {(["magazine", "gallery"] as const).map((v) => (
                <span key={v} data-on={v === shown ? "" : undefined}>
                  {label(v)}
                  <b>
                    {indices[v] + 1}/{counts[v]}
                  </b>
                </span>
              ))}
            </p>
            <VisuallyHidden aria-live="polite">
              {counterLabel} {index + 1} of {count}
            </VisuallyHidden>
            <MainButton
              rounded
              size="icon"
              type="button"
              className={styles.navButton}
              onClick={() => step(1)}
              disabled={index === count - 1}
              aria-label={`Next ${counterLabel.toLowerCase()}`}
            >
              <span className={`${zineStyles.navIcon} ${zineStyles.navIconNext}`} aria-hidden />
            </MainButton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

/** The dark background: the viewer itself, the empty room around the views
 * (data-backdrop), or the transparent room the zine book keeps around its
 * paper for the page curl. */
const isBackground = (e: React.SyntheticEvent) =>
  e.target === e.currentTarget ||
  (e.target instanceof Element &&
    (e.target.hasAttribute("data-zine-stage") || e.target.hasAttribute("data-backdrop")));

/** Long enough for the switcher's thumb to have landed (it settles in
 * ~170ms; mode-tabs' springs). */
const BOOK_MOUNT_DELAY_MS = 250;

/** The viewer's phone breakpoint (photo-viewer.module.css: max-width 640px).
 * There it is Gallery only: no switcher, and the book never starts. */
const PHONE_QUERY = "(max-width: 640px)";
const isPhoneNow = () => window.matchMedia(PHONE_QUERY).matches;

const useIsPhone = () => {
  const [phone, setPhone] = useState(isPhoneNow);
  useEffect(() => {
    const mq = window.matchMedia(PHONE_QUERY);
    const update = () => setPhone(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return phone;
};

/** How long the viewer is left alone before the book comes up behind Gallery. */
const BOOK_IDLE_MS = 1200;

/** How long a fade may run before the layer is unmounted regardless (the
 * longest is 450ms; transitionend normally gets there first). */
const FADE_FALLBACK_MS = 600;

/**
 * One view of the viewer, faded and scaled in or out with CSS transitions
 * (photo-viewer.module.css), so a switch back mid-fade simply turns round
 * from wherever it is. It mounts hidden and fades in on the next frame
 * (unless `instant`), and tells its host once it has faded out.
 */
const Layer = ({
  active,
  instant,
  onHidden,
  children,
  ...rest
}: {
  active: boolean;
  /** Start already shown (the view the viewer opens on). */
  instant: boolean;
  onHidden: () => void;
} & React.HTMLAttributes<HTMLDivElement> & { "data-backdrop"?: string }) => {
  const el = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(active && instant);
  const onHiddenRef = useRef(onHidden);
  onHiddenRef.current = onHidden;

  useEffect(() => {
    if (!active) {
      setOn(false);
      return;
    }
    // Make sure the hidden state has been styled, so there's a fade to run.
    void el.current?.offsetWidth;
    setOn(true);
  }, [active]);

  // Fallback for a fade that never reports its end (e.g. a hidden tab).
  const wasOn = useRef(on);
  useEffect(() => {
    if (on) {
      wasOn.current = true;
      return;
    }
    if (!wasOn.current) return;
    const timer = setTimeout(() => onHiddenRef.current(), FADE_FALLBACK_MS);
    return () => clearTimeout(timer);
  }, [on]);

  return (
    <div
      {...rest}
      ref={el}
      data-on={on ? "" : undefined}
      onTransitionEnd={(e) => {
        if (e.target === e.currentTarget && e.propertyName === "opacity" && !on) {
          onHiddenRef.current();
        }
      }}
    >
      {children}
    </div>
  );
};

/** One photo, contained in the stage, with a thin white print border. */
const GalleryPrint = ({ photo }: { photo?: PublicGalleryPhoto }) =>
  photo ? (
    <div className={styles.print}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={large(photo.image.img_url)}
        alt=""
        draggable={false}
        width={photo.image.img_width || undefined}
        height={photo.image.img_height || undefined}
      />
    </div>
  ) : null;

export default PhotoViewer;
