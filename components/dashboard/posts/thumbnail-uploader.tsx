"use client";

import { useRef, useState } from "react";
import { Image as ImageType } from "@prisma/client";
import { ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/shadcn/button";
import { cn } from "@/lib/utils";
import { deriveStaticFromGif, useMediaUpload } from "./use-media-upload";
import { UploadErrorOverlay, UploadProgressBadge } from "./upload-overlay";

export interface ThumbnailValue {
  image: ImageType | null;
  gif: ImageType | null;
}

interface ThumbnailUploaderProps {
  value: ThumbnailValue;
  onChange: (next: ThumbnailValue) => void;
  /** Report Cloudinary public_ids no longer referenced, for cleanup on save. */
  onOrphan: (publicIds: string[]) => void;
  error?: string;
}

const idsOf = (v: ThumbnailValue) => {
  const set = new Set<string>();
  if (v.image?.public_id) set.add(v.image.public_id);
  if (v.gif?.public_id) set.add(v.gif.public_id);
  return set;
};

/**
 * One uploader for both static images and GIFs. A static upload is saved as
 * `thumbnail_image` (GIF cleared); a GIF is saved as `thumbnail_gif` with a
 * derived static first-frame as `thumbnail_image`.
 */
export default function ThumbnailUploader({
  value,
  onChange,
  onOrphan,
  error,
}: ThumbnailUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const commit = (next: ThumbnailValue) => {
    const oldIds = idsOf(value);
    const newIds = idsOf(next);
    const orphans = [...oldIds].filter((id) => !newIds.has(id));
    if (orphans.length) onOrphan(orphans);
    onChange(next);
  };

  const upload = useMediaUpload((image, isGif) => {
    commit(
      isGif
        ? { image: deriveStaticFromGif(image), gif: image }
        : { image, gif: null }
    );
  });

  const pick = () => inputRef.current?.click();

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) upload.start(file);
  };

  const { image, gif } = value;
  const busy = upload.isUploading || upload.isError;
  const showEmpty = !image && !busy;

  return (
    <div className="space-y-3">
      <div
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
        className={cn(
          "relative aspect-square w-full max-w-[220px] overflow-hidden rounded-xl border bg-muted",
          showEmpty && "cursor-pointer hover:bg-muted/70",
          dragOver && "border-foreground ring-2 ring-foreground/20"
        )}
      >
        {busy ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={upload.previewUrl}
              alt=""
              className="size-full object-cover opacity-70"
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
              src={image.img_url}
              alt=""
              className="size-full object-cover"
            />
            {gif && (
              <span className="absolute left-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                GIF
              </span>
            )}
          </>
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground/50">
            <ImageIcon className="size-10" />
            <span className="text-xs">Click or drop an image</span>
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground">Thumbnail image</p>
        <div className="mt-2 flex items-center gap-2">
          {image && !busy ? (
            <>
              <Button type="button" variant="outline" size="sm" onClick={pick}>
                <Pencil className="size-4" />
                Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => commit({ image: null, gif: null })}
              >
                <Trash2 className="size-4" />
                Delete
              </Button>
            </>
          ) : (
            !busy && (
              <Button type="button" variant="outline" size="sm" onClick={pick}>
                <Plus className="size-4" />
                Add image
              </Button>
            )
          )}
        </div>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.gif,.svg,image/*"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
