"use client";

/** Long edge cap for gallery uploads; the lightbox shows at most ~2000px. */
const MAX_EDGE = 2560;
/** Files under this are uploaded as-is if they already fit MAX_EDGE. */
const SMALL_ENOUGH = 3_500_000;

/**
 * Downscale big exports (film scans, camera JPEGs) in the browser before they
 * go up. The upload route has a ~4.5MB request limit in production, and the
 * grid never needs more than 2560px. Keeps the original aspect ratio; GIF/SVG
 * and anything the browser can't decode are passed through untouched.
 */
export const shrinkImage = async (file: File): Promise<File> => {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  const { width, height } = bitmap;
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  if (scale === 1 && file.size <= SMALL_ENOUGH) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.9)
  );
  if (!blob) return file;

  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg" });
};
