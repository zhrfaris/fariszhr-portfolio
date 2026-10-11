import { ZINE_PAGE_ASPECT } from "@/content/home";
import type { PageSource } from "@/components/home/zine/page-textures";
import { PublicGalleryPhoto } from "@/actions/gallery/get/types";
import { cldUrl } from "@/lib/landing";
import type { Zine } from "./zine";

/**
 * Page faces for the home zine book (components/home/zine), drawn from the
 * photo set: spread n of the zine is faces 2n (left) and 2n + 1 (right).
 *
 * - landscape: one photo across the whole spread, over the fold, with an even
 *   white margin on the outer sides, top and bottom;
 * - portrait pair: one portrait per page, each inside its own white margin,
 *   so the fold stays white between them;
 * - lone portrait: on the left page, the right page left plain white.
 * Every photo fills an area of the same height (page height minus the
 * margins), with object-fit: cover.
 *
 * The margin is given in texture pixels by the viewer, which works it out
 * from the on-screen print border and the book's rendered page width; it is
 * read when a face is drawn.
 */

/** Face size in pixels; the zine's own page aspect (3:4). */
export const FACE_W = 1200;
const FACE_H = Math.round(FACE_W * ZINE_PAGE_ASPECT);
const PAPER = "#ffffff";

const images = new Map<string, Promise<HTMLImageElement>>();
const loadImage = (url: string) => {
  let p = images.get(url);
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
    images.set(url, p);
    p.catch(() => images.delete(url));
  }
  return p;
};

/** The full-size image a face is drawn from (also the viewer's flying copy). */
export const faceSource = (photo: PublicGalleryPhoto) =>
  cldUrl(photo.image.img_url, "w_2400,h_2400,c_limit,q_auto,f_auto");
const source = faceSource;

/**
 * Fetch and decode the photos a book is about to draw (on pointerdown of a
 * thumbnail), so the faces are composed from images already in memory.
 */
export const warmPhotos = (photos: PublicGalleryPhoto[]) => {
  photos.forEach((photo) =>
    loadImage(source(photo))
      .then((img) => img.decode?.())
      .catch(() => {})
  );
};

const blankFace = () => {
  const canvas = document.createElement("canvas");
  canvas.width = FACE_W;
  canvas.height = FACE_H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, FACE_W, FACE_H);
  return { canvas, ctx };
};

/** Draw `img` to cover the box (x, y, w, h), cropping the overflow. */
const drawCover = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) => {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (img.naturalWidth - sw) / 2;
  const sy = (img.naturalHeight - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
};

/** A portrait inside its own page, white margin all round. */
const portraitFace =
  (photo: PublicGalleryPhoto, margin: () => number) => async () => {
    const { canvas, ctx } = blankFace();
    const img = await loadImage(source(photo));
    const m = margin();
    drawCover(ctx, img, m, m, FACE_W - m * 2, FACE_H - m * 2);
    return canvas;
  };

/** One half of a landscape that runs across the spread and over the fold. */
const landscapeFace =
  (photo: PublicGalleryPhoto, side: "left" | "right", margin: () => number) =>
  async () => {
    const { canvas, ctx } = blankFace();
    const img = await loadImage(source(photo));
    const m = margin();
    // The photo's box across both pages, in spread coordinates.
    const boxW = FACE_W * 2 - m * 2;
    const boxH = FACE_H - m * 2;
    // Draw the whole spread-wide box and let the face clip it at the fold.
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, FACE_W, FACE_H);
    ctx.clip();
    drawCover(ctx, img, side === "left" ? m : m - FACE_W, m, boxW, boxH);
    ctx.restore();
    return canvas;
  };

const plainFace = async () => blankFace().canvas;

/** Composed faces kept for a book that is brought up again (the viewer's
 * Magazine, after a spell in Gallery): the open spread and its neighbours. */
const KEEP_FACES = 8;

/** `margin`: the white margin in texture pixels, read at draw time. */
export const buildFaces = (
  photos: PublicGalleryPhoto[],
  zine: Zine,
  margin: () => number,
): PageSource[] => {
  const kept = new Map<number, Promise<HTMLCanvasElement>>();
  const keep = (draw: () => Promise<HTMLCanvasElement>, i: number) => () => {
    let face = kept.get(i);
    if (face)
      kept.delete(i); // re-insert below: most recently used last
    else face = draw();
    kept.set(i, face);
    face.catch(() => kept.delete(i));
    if (kept.size > KEEP_FACES) kept.delete(kept.keys().next().value!);
    return face;
  };
  return zine.pages
    .flatMap((page): (() => Promise<HTMLCanvasElement>)[] => {
      if (page.kind === "pair") {
        return [
          portraitFace(photos[page.photos[0]], margin),
          portraitFace(photos[page.photos[1]], margin),
        ];
      }
      const photo = photos[page.photos[0]];
      if (page.kind === "solo") return [portraitFace(photo, margin), plainFace];
      return [
        landscapeFace(photo, "left", margin),
        landscapeFace(photo, "right", margin),
      ];
    })
    .map(keep);
};
