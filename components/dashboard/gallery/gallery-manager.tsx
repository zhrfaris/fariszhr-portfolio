"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Image as ImageType } from "@prisma/client";
import { GripVertical, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { GalleryPhoto } from "@/actions/gallery/get/types";
import { createGalleryPhotos } from "@/actions/gallery/create-many";
import { deleteGalleryPhotos } from "@/actions/gallery/delete-many";
import { reorderGalleryPhotos } from "@/actions/gallery/reorder";
import { Button } from "@/components/shadcn/button";
import AlertDialogWrapper from "@/components/wrappers/alert-dialog-wrapper";
import { useAction } from "@/hooks/use-action";
import { cn } from "@/lib/utils";
import { cldUrl } from "@/lib/landing";
import { isAcceptedImage } from "@/components/dashboard/posts/block-editor/upload";
import {
  createUploadTask,
  removeUploadTask,
  retryUploadTask,
  useUploadTask,
} from "@/components/dashboard/posts/block-editor/upload-manager";
import { resultToImage } from "@/components/dashboard/posts/use-media-upload";
import {
  UploadErrorOverlay,
  UploadProgressBadge,
} from "@/components/dashboard/posts/upload-overlay";
import { shrinkImage } from "./shrink-image";

/** Uploads running at once; the rest wait in line. */
const CONCURRENCY = 3;
/** Finished uploads are saved to the database in batches. */
const SAVE_DEBOUNCE_MS = 800;
const MAX_FILE_BYTES = 25_000_000;
const TILE_HEIGHT = 140;

type Pending = {
  key: string;
  file: File;
  started: boolean;
  taskId: string | null;
};

const GalleryManager = ({ initialPhotos }: { initialPhotos: GalleryPhoto[] }) => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(initialPhotos);
  const [pending, setPending] = useState<Pending[]>([]);
  const [dropActive, setDropActive] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // What the database currently holds, to send only the moved photos.
  const savedOrder = useRef(
    new Map(initialPhotos.map((p) => [p.id, p.order] as const))
  );

  /* ---------- save finished uploads in batches ---------- */

  const finished = useRef<ImageType[]>([]);
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { execute: executeCreate } = useAction(createGalleryPhotos, {
    onSuccess: (created) => {
      created.forEach((p) => savedOrder.current.set(p.id, p.order));
      setPhotos((prev) => [...prev, ...created]);
      toast.success(
        created.length === 1 ? "Photo added" : `${created.length} photos added`
      );
    },
    onError: (error) => toast.error(error),
  });

  const flush = useCallback(() => {
    flushTimer.current = null;
    const images = finished.current.splice(0);
    if (images.length) void executeCreate({ images });
  }, [executeCreate]);

  const onUploaded = useCallback(
    (key: string, image: ImageType) => {
      setPending((prev) => prev.filter((p) => p.key !== key));
      finished.current.push(image);
      if (flushTimer.current) clearTimeout(flushTimer.current);
      flushTimer.current = setTimeout(flush, SAVE_DEBOUNCE_MS);
    },
    [flush]
  );

  useEffect(
    () => () => {
      if (flushTimer.current) clearTimeout(flushTimer.current);
    },
    []
  );

  /* ---------- upload queue ---------- */

  const startItem = useCallback(async (item: Pending) => {
    const file = await shrinkImage(item.file);
    const { id } = createUploadTask(file);
    setPending((prev) =>
      prev.map((p) => (p.key === item.key ? { ...p, taskId: id } : p))
    );
  }, []);

  useEffect(() => {
    const running = pending.filter((p) => p.started).length;
    const next = pending
      .filter((p) => !p.started)
      .slice(0, Math.max(0, CONCURRENCY - running));
    if (!next.length) return;
    const keys = new Set(next.map((n) => n.key));
    setPending((prev) =>
      prev.map((p) => (keys.has(p.key) ? { ...p, started: true } : p))
    );
    next.forEach((n) => void startItem(n));
  }, [pending, startItem]);

  const busy = pending.length > 0;
  useEffect(() => {
    if (!busy) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [busy]);

  const addFiles = (files: FileList | File[] | null) => {
    if (!files) return;
    const accepted: Pending[] = [];
    let skipped = 0;
    for (const file of Array.from(files)) {
      if (!isAcceptedImage(file) || file.size > MAX_FILE_BYTES) {
        skipped += 1;
        continue;
      }
      accepted.push({
        key: crypto.randomUUID(),
        file,
        started: false,
        taskId: null,
      });
    }
    if (skipped) {
      toast.error(
        `${skipped} file${skipped > 1 ? "s" : ""} skipped (not an image or over 25MB)`
      );
    }
    if (accepted.length) setPending((prev) => [...prev, ...accepted]);
  };

  const removePending = (key: string, taskId: string | null) => {
    if (taskId) removeUploadTask(taskId);
    setPending((prev) => prev.filter((p) => p.key !== key));
  };

  /* ---------- reorder (drag) ---------- */

  const { execute: executeReorder } = useAction(reorderGalleryPhotos, {
    onProceed: () => {
      toast.loading("Saving order...", { id: "loading-reorder-gallery" });
    },
    onSuccess: () => {
      toast.success("Order saved!");
    },
    onError: (error) => toast.error(error),
    onComplete: () => toast.dismiss("loading-reorder-gallery"),
  });

  const moveTo = (id: string, overId: string) => {
    if (id === overId) return;
    setPhotos((prev) => {
      const from = prev.findIndex((p) => p.id === id);
      const to = prev.findIndex((p) => p.id === overId);
      if (from < 0 || to < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const persistOrder = () => {
    const changed = photos
      .map((p, index) => ({ id: p.id, order: index }))
      .filter((p) => savedOrder.current.get(p.id) !== p.order);
    if (!changed.length) return;
    changed.forEach((p) => savedOrder.current.set(p.id, p.order));
    setPhotos((prev) => prev.map((p, index) => ({ ...p, order: index })));
    void executeReorder(changed);
  };

  /* ---------- delete ---------- */

  const { execute: executeDelete } = useAction(deleteGalleryPhotos, {
    onProceed: () => {
      toast.loading("Deleting photo...", { id: "loading-delete-gallery" });
    },
    onSuccess: () => toast.success("Photo deleted!"),
    onError: (error) => toast.error(error),
    onComplete: () => toast.dismiss("loading-delete-gallery"),
  });

  const removePhoto = async (photo: GalleryPhoto) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    savedOrder.current.delete(photo.id);
    await executeDelete({ ids: [photo.id] });
  };

  /* ---------- render ---------- */

  const queued = pending.filter((p) => !p.taskId).length;

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => {
          if (!e.dataTransfer.types.includes("Files")) return;
          e.preventDefault();
          setDropActive(true);
        }}
        onDragLeave={() => setDropActive(false)}
        onDrop={(e) => {
          if (!e.dataTransfer.files.length) return;
          e.preventDefault();
          setDropActive(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/40 px-6 py-10 text-center",
          dropActive && "border-foreground bg-muted"
        )}
      >
        <ImagePlus className="size-8 text-muted-foreground" />
        <div>
          <p className="text-sm font-semibold">
            Drop photos here, or pick several at once
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            JPG, PNG or WebP. Each photo keeps its own aspect ratio. Large files
            are scaled to 2560px on the long edge before uploading.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="bg-background"
          onClick={() => inputRef.current?.click()}
        >
          Upload photos
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".png,.jpg,.jpeg,.webp,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {busy && (
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Uploading {pending.length} photo{pending.length > 1 ? "s" : ""}
            {queued > 0 && ` (${queued} waiting)`}. Keep this tab open.
          </p>
          <div className="flex flex-wrap gap-2">
            {pending.map((item) => (
              <PendingTile
                key={item.key}
                item={item}
                onUploaded={onUploaded}
                onRemove={removePending}
              />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-semibold">
            Photos{" "}
            <span className="text-sm font-normal text-muted-foreground">
              ({photos.length})
            </span>
          </h2>
          {photos.length > 1 && (
            <p className="text-xs text-muted-foreground">
              Drag to reorder. The order here is the order on /photography.
            </p>
          )}
        </div>

        {photos.length === 0 ? (
          <p className="rounded-xl border bg-muted/40 px-6 py-10 text-center text-sm text-muted-foreground">
            No photos yet. The Photo works page shows an empty state until you
            add some.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {photos.map((photo, index) => (
              <SavedTile
                key={photo.id}
                photo={photo}
                index={index}
                dragging={dragId === photo.id}
                onDragStart={() => setDragId(photo.id)}
                onDragOver={() => dragId && moveTo(dragId, photo.id)}
                onDragEnd={() => {
                  setDragId(null);
                  persistOrder();
                }}
                onDelete={() => removePhoto(photo)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PendingTile = ({
  item,
  onUploaded,
  onRemove,
}: {
  item: Pending;
  onUploaded: (key: string, image: ImageType) => void;
  onRemove: (key: string, taskId: string | null) => void;
}) => {
  const task = useUploadTask(item.taskId);
  const preview = useMemo(() => URL.createObjectURL(item.file), [item.file]);
  useEffect(() => () => URL.revokeObjectURL(preview), [preview]);

  useEffect(() => {
    if (!item.taskId || task?.status !== "done" || !task.result) return;
    onUploaded(item.key, resultToImage(task.result));
    removeUploadTask(item.taskId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.taskId, task?.status]);

  return (
    <div
      className="relative overflow-hidden rounded-md border bg-muted"
      style={{ height: TILE_HEIGHT, width: TILE_HEIGHT }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={preview} alt="" className="size-full object-cover opacity-60" />
      {!task && (
        <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-1 text-[11px] text-white">
          {item.started ? "Preparing…" : "Waiting"}
        </span>
      )}
      {task && task.status !== "error" && (
        <div className="absolute inset-0 scale-75">
          <UploadProgressBadge status={task.status} progress={task.progress} />
        </div>
      )}
      {task?.status === "error" && (
        <UploadErrorOverlay
          message={task.error}
          onRetry={() => item.taskId && retryUploadTask(item.taskId)}
          onRemove={() => onRemove(item.key, item.taskId)}
        />
      )}
    </div>
  );
};

const SavedTile = ({
  photo,
  index,
  dragging,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDelete,
}: {
  photo: GalleryPhoto;
  index: number;
  dragging: boolean;
  onDragStart: () => void;
  onDragOver: () => void;
  onDragEnd: () => void;
  onDelete: () => Promise<void>;
}) => {
  const { img_width, img_height, img_url } = photo.image;
  const ratio = img_width && img_height ? img_width / img_height : 1;

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", photo.id);
        onDragStart();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        onDragOver();
      }}
      onDrop={(e) => e.preventDefault()}
      onDragEnd={onDragEnd}
      className={cn(
        "group relative cursor-grab overflow-hidden rounded-md border bg-muted active:cursor-grabbing",
        dragging && "opacity-40 ring-2 ring-foreground"
      )}
      style={{ height: TILE_HEIGHT, width: Math.round(TILE_HEIGHT * ratio) }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cldUrl(img_url, "h_280,c_limit,q_auto,f_auto")}
        alt=""
        loading="lazy"
        draggable={false}
        className="size-full object-cover"
      />
      <span className="absolute left-1.5 top-1.5 flex items-center gap-0.5 rounded bg-black/60 px-1 py-0.5 text-[10px] font-medium text-white">
        <GripVertical className="size-3" />
        {index + 1}
      </span>
      <div className="absolute right-1.5 top-1.5 hidden group-hover:block group-focus-within:block">
        <AlertDialogWrapper
          header="Delete photo?"
          description="It will be removed from the Photo works grid and from storage. This can't be undone."
          proceedHandler={() => void onDelete()}
        >
          <Button
            type="button"
            size="icon"
            className="size-7 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90"
            aria-label={`Delete photo ${index + 1}`}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </AlertDialogWrapper>
      </div>
    </div>
  );
};

export default GalleryManager;
