"use client";

import { useCallback, useSyncExternalStore } from "react";

import { DEFAULT_INLINE_RADIUS } from "@/lib/section-content";
import { CloudinaryImageAttrs } from "./upload";

export type UploadStatus = "uploading" | "processing" | "error" | "done";

export interface UploadTask {
  id: string;
  file: File;
  objectUrl: string;
  /** Browser -> server transfer percentage (0-100). */
  progress: number;
  status: UploadStatus;
  error?: string;
  /** Final Cloudinary attributes, present once status === "done". */
  result?: CloudinaryImageAttrs;
  xhr?: XMLHttpRequest;
}

/**
 * Module-level manager so every inserted image tracks its own upload
 * independently, without pushing progress into ProseMirror transactions. Node
 * views subscribe to their task; the post form subscribes to the active count.
 */
const tasks = new Map<string, UploadTask>();
const taskListeners = new Map<string, Set<() => void>>();
const activeListeners = new Set<() => void>();

const emitActive = () => activeListeners.forEach((l) => l());

const emitTask = (id: string) => {
  taskListeners.get(id)?.forEach((l) => l());
  emitActive();
};

const patchTask = (id: string, patch: Partial<UploadTask>) => {
  const prev = tasks.get(id);
  if (!prev) return;
  // Replace with a new object so useSyncExternalStore sees a changed reference.
  tasks.set(id, { ...prev, ...patch });
  emitTask(id);
};

const countActive = () => {
  let n = 0;
  tasks.forEach((t) => {
    if (t.status === "uploading" || t.status === "processing") n += 1;
  });
  return n;
};

const finishWithPlaceholder = async (id: string, xhr: XMLHttpRequest) => {
  if (xhr.status < 200 || xhr.status >= 300) {
    let message = `Upload failed (${xhr.status})`;
    try {
      const err = JSON.parse(xhr.responseText);
      const detail = err?.error?.message ?? err?.error;
      if (detail) message = String(detail);
    } catch {
      // non-JSON body; keep status message
    }
    patchTask(id, { status: "error", error: message });
    return;
  }

  // Transfer done, Cloudinary + placeholder still pending.
  patchTask(id, { status: "processing", progress: 100 });

  let image: {
    img_url: string;
    img_url_thumbnail?: string;
    public_id: string;
    img_width?: number;
    img_height?: number;
    img_type?: string;
  };
  try {
    image = JSON.parse(xhr.responseText).image;
    if (!image?.img_url) throw new Error("missing image url");
  } catch {
    patchTask(id, { status: "error", error: "Invalid server response" });
    return;
  }

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

  const result: CloudinaryImageAttrs = {
    src: image.img_url,
    publicId: image.public_id,
    placeholder,
    thumbnail: image.img_url_thumbnail || image.img_url,
    width: image.img_width ?? null,
    height: image.img_height ?? null,
    imgType: image.img_type ?? null,
    radius: DEFAULT_INLINE_RADIUS,
  };

  patchTask(id, { status: "done", result });
};

const startXhr = (id: string) => {
  const task = tasks.get(id);
  if (!task) return;

  patchTask(id, { status: "uploading", progress: 0, error: undefined });

  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/image/upload");

  xhr.upload.onprogress = (e: ProgressEvent) => {
    if (!e.lengthComputable) return;
    const pct = Math.round((e.loaded / e.total) * 100);
    if (pct >= 100) {
      patchTask(id, { progress: 100, status: "processing" });
    } else {
      patchTask(id, { progress: pct });
    }
  };

  xhr.onload = () => {
    void finishWithPlaceholder(id, xhr);
  };
  xhr.onerror = () =>
    patchTask(id, { status: "error", error: "Network error during upload" });

  const formData = new FormData();
  formData.append("image", task.file);

  patchTask(id, { xhr });
  xhr.send(formData);
};

export const createUploadTask = (
  file: File
): { id: string; objectUrl: string } => {
  const id = crypto.randomUUID();
  const objectUrl = URL.createObjectURL(file);
  tasks.set(id, { id, file, objectUrl, progress: 0, status: "uploading" });
  emitActive();
  startXhr(id);
  return { id, objectUrl };
};

export const retryUploadTask = (id: string) => startXhr(id);

export const removeUploadTask = (id: string) => {
  const task = tasks.get(id);
  if (!task) return;
  try {
    task.xhr?.abort();
  } catch {
    // ignore
  }
  URL.revokeObjectURL(task.objectUrl);
  tasks.delete(id);
  taskListeners.delete(id);
  emitActive();
};

export const getUploadTask = (id: string) => tasks.get(id);

export const useUploadTask = (id: string | null): UploadTask | undefined => {
  const subscribe = useCallback(
    (cb: () => void) => {
      if (!id) return () => {};
      let set = taskListeners.get(id);
      if (!set) {
        set = new Set();
        taskListeners.set(id, set);
      }
      set.add(cb);
      return () => {
        set?.delete(cb);
      };
    },
    [id]
  );
  const getSnapshot = useCallback(() => (id ? tasks.get(id) : undefined), [id]);
  return useSyncExternalStore(subscribe, getSnapshot, () => undefined);
};

export const useActiveUploadCount = (): number => {
  const subscribe = useCallback((cb: () => void) => {
    activeListeners.add(cb);
    return () => {
      activeListeners.delete(cb);
    };
  }, []);
  return useSyncExternalStore(subscribe, countActive, () => 0);
};
