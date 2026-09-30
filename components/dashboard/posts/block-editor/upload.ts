import { ContentImageRadiusType } from "@/actions/post/create/schema";
import { DEFAULT_INLINE_RADIUS } from "@/lib/section-content";

export interface CloudinaryImageAttrs {
  src: string;
  publicId: string;
  placeholder: string;
  thumbnail: string;
  width: number | null;
  height: number | null;
  imgType: string | null;
  radius: ContentImageRadiusType;
}

const ACCEPTED = ["png", "jpg", "jpeg", "gif", "svg"];

export const isAcceptedImage = (file: File) => {
  const ext = file.name.split(".").pop()?.toLowerCase();
  return file.type.startsWith("image/") || (ext ? ACCEPTED.includes(ext) : false);
};

/**
 * Upload a file to Cloudinary via the existing /api/image/upload route, then
 * fetch a proper (small) blur placeholder from /api/image/placeholder. Returns
 * the attributes stored on the inline image node.
 *
 * The upload route returns the full original base64 as img_url_placeholder,
 * which is far too large to embed in the section HTML — we deliberately replace
 * it with the plaiceholder blur (falling back to the thumbnail url).
 */
export const uploadImageFile = async (
  file: File
): Promise<CloudinaryImageAttrs> => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("/api/image/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let message = `Upload failed (${res.status})`;
    try {
      const err = await res.json();
      const detail = err?.error?.message ?? err?.error;
      if (detail) message = String(detail);
    } catch {
      // response had no JSON body; keep the status-based message
    }
    throw new Error(message);
  }

  const { image } = await res.json();

  let placeholder = image.img_url_thumbnail || image.img_url;
  try {
    const pRes = await fetch("/api/image/placeholder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: image.img_url }),
    });
    if (pRes.ok) {
      const data = await pRes.json();
      if (data?.base64) placeholder = data.base64;
    }
  } catch {
    // keep thumbnail fallback
  }

  return {
    src: image.img_url,
    publicId: image.public_id,
    placeholder,
    thumbnail: image.img_url_thumbnail || image.img_url,
    width: image.img_width ?? null,
    height: image.img_height ?? null,
    imgType: image.img_type ?? null,
    radius: DEFAULT_INLINE_RADIUS,
  };
};

export const deleteCloudinaryImage = async (publicId: string) => {
  if (!publicId) return;
  try {
    await fetch("/api/image/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ public_id: publicId }),
    });
  } catch {
    // best-effort cleanup; ignore failures
  }
};
