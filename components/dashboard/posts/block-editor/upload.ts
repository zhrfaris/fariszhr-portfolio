import { ContentImageRadiusType } from "@/actions/post/create/schema";

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

// The actual upload (XHR with progress) + placeholder fetch now lives in
// upload-manager.ts. This module keeps the shared type, the accepted-file check,
// and the delete helper.

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
