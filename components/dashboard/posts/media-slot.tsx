"use client";

import { useRef, useState } from "react";
import { Image as ImageType } from "@prisma/client";
import { ImagePlus, RefreshCw, Trash2 } from "lucide-react";

import { Button } from "@/components/shadcn/button";
import { Label } from "@/components/shadcn/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";
import { cn } from "@/lib/utils";
import { useMediaUpload } from "./use-media-upload";
import { UploadErrorOverlay, UploadProgressBadge } from "./upload-overlay";

/**
 * One image slot of the post editor (thumbnail image / GIF, cover). Purely
 * presentational: the owner keeps the upload hook and decides what a picked or
 * dropped file does. Empty = the slot itself is a dashed dropzone; filled =
 * the whole image (never cropped) with icon buttons top-right; uploading =
 * the preview with the progress badge or the error overlay.
 *
 * Sizing follows the image's own aspect ratio (stored dimensions, else read on
 * load; `emptyRatio` while there is none), in one of two ways:
 * - default: width from `className`, height from the ratio, capped at 320px;
 * - `fixedHeight`: height fixed, width from the ratio, capped at `maxWidth`
 *   (past the cap the image letterboxes inside the slot).
 */
export default function MediaSlot({
  label,
  name,
  aside,
  image,
  upload,
  accept,
  onFile,
  onRemove,
  invalid,
  emptyRatio,
  fixedHeight,
  maxWidth = Infinity,
  previewSrc,
  className,
}: {
  /** Shown above the slot; omit when the owner labels it elsewhere (then
   * pass `name` for the empty slot's accessible name). */
  label?: string;
  /** What the image is, for screen readers, when there is no `label`. */
  name?: string;
  /** Right side of the label row (e.g. "Auto from GIF"). */
  aside?: string;
  image: ImageType | null;
  upload: ReturnType<typeof useMediaUpload>;
  accept: string;
  onFile: (file: File) => void;
  onRemove: () => void;
  invalid?: boolean;
  /** Width / height while empty, e.g. 4 / 3. */
  emptyRatio: number;
  /** Fixed slot height in px; the width then follows the image. */
  fixedHeight?: number;
  /** Width cap in px for `fixedHeight` slots. */
  maxWidth?: number;
  /** Maps the stored URL to the one to display (e.g. a smaller Cloudinary
   * rendition). */
  previewSrc?: (url: string) => string;
  /** Width of the slot. */
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  // Natural ratio read from the <img>, keyed by its URL so a new image
  // never inherits the previous one's shape.
  const [loaded, setLoaded] = useState<{ src: string; ratio: number } | null>(
    null
  );

  const pick = () => inputRef.current?.click();
  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) onFile(file);
  };

  const busy = upload.isUploading || upload.isError;
  const showEmpty = !image && !busy;
  const src = busy ? upload.previewUrl : image?.img_url;

  const stored =
    !busy && image && image.img_width > 0 && image.img_height > 0
      ? image.img_width / image.img_height
      : null;
  const ratio =
    (loaded && loaded.src === src ? loaded.ratio : stored) ?? emptyRatio;

  // Fixed height: the inner box (inside the 1px border) gets the ratio, so
  // an image fills it exactly until the width cap. Empty slots use the same
  // formula with `emptyRatio`, so an empty slot given a filled slot's ratio
  // comes out exactly as wide.
  const fixedWidth = fixedHeight
    ? Math.min(Math.round((fixedHeight - 2) * ratio + 2), maxWidth)
    : undefined;

  const onImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    if (w > 0 && h > 0 && src) setLoaded({ src, ratio: w / h });
  };

  return (
    <div
      className={cn("min-w-0 space-y-2", className)}
      style={fixedWidth ? { width: fixedWidth } : undefined}
    >
      {(label || aside) && (
        <div className="flex items-center justify-between gap-2">
          {label && <Label>{label}</Label>}
          {aside && (
            <span className="text-xs leading-none text-muted-foreground">
              {aside}
            </span>
          )}
        </div>
      )}

      <div
        role={showEmpty ? "button" : undefined}
        tabIndex={showEmpty ? 0 : undefined}
        aria-label={
          showEmpty
            ? `Add ${(label ?? name ?? "image").toLowerCase()}`
            : undefined
        }
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={showEmpty ? pick : undefined}
        onKeyDown={
          showEmpty
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  pick();
                }
              }
            : undefined
        }
        // Default: width is fixed, so the height follows the ratio; max-height
        // wins over aspect-ratio and the image then letterboxes (contain).
        // Fixed height: the wrapper above carries the computed width.
        style={fixedHeight ? { height: fixedHeight } : { aspectRatio: ratio }}
        className={cn(
          "relative max-h-[320px] w-full overflow-hidden rounded-md bg-muted outline-none focus-visible:ring-focus focus-visible:ring-ring",
          showEmpty
            ? "cursor-pointer border border-dashed border-input transition-colors hover:bg-secondary"
            : "border",
          invalid && "border-destructive",
          dragOver && "border-primary bg-primary-tint"
        )}
      >
        {busy ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={upload.previewUrl}
              alt=""
              onLoad={onImgLoad}
              className="absolute inset-0 size-full object-contain opacity-70"
            />
            {upload.isUploading && (
              <UploadProgressBadge
                status={upload.status}
                progress={upload.progress}
              />
            )}
            {upload.isError && (
              <UploadErrorOverlay
                message={upload.task?.error}
                onRetry={upload.retry}
                onRemove={upload.cancel}
              />
            )}
          </>
        ) : image ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewSrc ? previewSrc(image.img_url) : image.img_url}
              alt=""
              onLoad={onImgLoad}
              className="absolute inset-0 size-full object-contain"
            />
            {/* Icon buttons on the image, stacked top-right. The upload
                overlays replace this whole branch while busy. */}
            <TooltipProvider delayDuration={200}>
              <div className="absolute right-2 top-2 z-10 flex flex-col gap-1.5">
                <SlotAction label="Replace image" onClick={pick}>
                  <RefreshCw />
                </SlotAction>
                <SlotAction label="Remove image" onClick={onRemove} destructive>
                  <Trash2 />
                </SlotAction>
              </div>
            </TooltipProvider>
          </>
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImagePlus className="size-5" />
            <span className="text-[13px]">Add image</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function SlotAction({
  label,
  onClick,
  destructive,
  children,
}: {
  label: string;
  onClick: () => void;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={label}
          onClick={onClick}
          className={cn(
            "size-8 rounded-md border-border bg-background hover:bg-muted",
            destructive
              ? "text-destructive hover:text-destructive"
              : "text-foreground hover:text-foreground"
          )}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">{label}</TooltipContent>
    </Tooltip>
  );
}
