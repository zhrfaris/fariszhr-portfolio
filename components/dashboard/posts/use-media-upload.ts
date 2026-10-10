"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Image as ImageType } from "@prisma/client";
import { toast } from "sonner";

import { isAcceptedImage, CloudinaryImageAttrs } from "./block-editor/upload";
import {
  createUploadTask,
  removeUploadTask,
  retryUploadTask,
  useUploadTask,
} from "./block-editor/upload-manager";

const MAX_FILE_BYTES = 10_000_000;

/** Map the upload manager's Cloudinary attrs onto a Prisma Image record. */
export const resultToImage = (r: CloudinaryImageAttrs): ImageType => ({
  public_id: r.publicId,
  img_url: r.src,
  img_url_thumbnail: r.thumbnail || r.src,
  img_url_placeholder: r.placeholder || "",
  img_width: r.width ?? 0,
  img_height: r.height ?? 0,
  img_type: r.imgType ?? null,
});

/**
 * Derive a static first-frame JPG from an uploaded animated GIF using a
 * Cloudinary URL transformation (`f_jpg,pg_1`). Shares the GIF's public_id, so
 * both reference a single Cloudinary asset.
 */
export const deriveStaticFromGif = (gif: ImageType): ImageType => {
  const staticUrl = gif.img_url
    .replace("/upload/", "/upload/f_jpg,pg_1/")
    .replace(/\.gif(\?|$)/i, ".jpg$1");
  return {
    ...gif,
    img_url: staticUrl,
    img_url_thumbnail: staticUrl,
    img_type: "jpg",
  };
};

/**
 * Shared single-file uploader built on the block editor's upload manager, so
 * the thumbnail / cover uploaders get the exact same XHR-with-progress
 * behavior (and are counted by `useActiveUploadCount`, which disables Save).
 */
export const useMediaUpload = (
  onUploaded: (image: ImageType, isGif: boolean) => void
) => {
  const [taskId, setTaskId] = useState<string | null>(null);
  const task = useUploadTask(taskId);
  const erroredRef = useRef<string | null>(null);

  useEffect(() => {
    if (!taskId || task?.status !== "done" || !task.result) return;
    const image = resultToImage(task.result);
    onUploaded(image, (task.result.imgType ?? "").toLowerCase() === "gif");
    removeUploadTask(taskId);
    setTaskId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, task?.status]);

  useEffect(() => {
    if (task?.status === "error" && erroredRef.current !== taskId) {
      erroredRef.current = taskId;
      toast.error(task.error ?? "Upload failed");
    }
  }, [task?.status, task?.error, taskId]);

  const start = useCallback((file: File) => {
    if (!isAcceptedImage(file)) {
      toast.error("Unsupported file type");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      toast.error("File size must be less than 10MB");
      return;
    }
    const { id } = createUploadTask(file);
    erroredRef.current = null;
    setTaskId(id);
  }, []);

  const retry = useCallback(() => {
    if (taskId) retryUploadTask(taskId);
  }, [taskId]);

  const cancel = useCallback(() => {
    if (taskId) removeUploadTask(taskId);
    setTaskId(null);
  }, [taskId]);

  const isUploading =
    !!taskId && (task?.status === "uploading" || task?.status === "processing");
  const isError = !!taskId && task?.status === "error";

  return {
    task,
    isUploading,
    isError,
    previewUrl: task?.objectUrl,
    progress: task?.progress ?? 0,
    status: task?.status,
    start,
    retry,
    cancel,
  };
};
