"use client";

import { forwardRef, useRef, useState } from "react";
import { Image as ImageType } from "@prisma/client";
import { ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

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

/** The image slot holds the GIF's derived first frame (same Cloudinary asset). */
export const isAutoFromGif = (v: ThumbnailValue) =>
  !!v.image && !!v.gif && v.image.public_id === v.gif.public_id;

/**
 * Two side-by-side slots: `thumbnail_image` (any image) and `thumbnail_gif`
 * (GIFs only). Uploading a GIF while the image slot is empty fills it with the
 * GIF's static first frame; deleting the GIF clears that derived frame too, but
 * leaves a separately uploaded image alone.
 */
const ThumbnailUploader = forwardRef<HTMLDivElement, ThumbnailUploaderProps>(
  function ThumbnailUploader({ value, onChange, onOrphan, error }, ref) {
    const commit = (next: ThumbnailValue) => {
      const newIds = idsOf(next);
      const orphans = [...idsOf(value)].filter((id) => !newIds.has(id));
      if (orphans.length) onOrphan(orphans);
      onChange(next);
    };

    const autoFrame = isAutoFromGif(value);

    return (
      <div ref={ref} tabIndex={-1} className="outline-none">
        <div className="grid gap-6 sm:grid-cols-2">
          <ThumbnailSlot
            label="Thumbnail Image"
            caption={autoFrame ? "Auto from GIF" : undefined}
            image={value.image}
            accept=".png,.jpg,.jpeg,.gif,.svg,image/*"
            onUploaded={(image) => commit({ ...value, image })}
            onDelete={() => commit({ ...value, image: null })}
          />
          <ThumbnailSlot
            label="Thumbnail GIF"
            image={value.gif}
            accept=".gif,image/gif"
            gifOnly
            onUploaded={(gif) =>
              commit({
                gif,
                // Fill an empty image slot (or refresh a stale derived frame).
                image:
                  !value.image || autoFrame
                    ? deriveStaticFromGif(gif)
                    : value.image,
              })
            }
            onDelete={() =>
              commit({ gif: null, image: autoFrame ? null : value.image })
            }
          />
        </div>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);

function ThumbnailSlot({
  label,
  caption,
  image,
  accept,
  gifOnly,
  onUploaded,
  onDelete,
}: {
  label: string;
  caption?: string;
  image: ImageType | null;
  accept: string;
  gifOnly?: boolean;
  onUploaded: (image: ImageType) => void;
  onDelete: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const upload = useMediaUpload((img) => onUploaded(img));

  const pick = () => inputRef.current?.click();

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (gifOnly && file.type !== "image/gif") {
      toast.error("Thumbnail GIF must be a .gif file");
      return;
    }
    upload.start(file);
  };

  const busy = upload.isUploading || upload.isError;
  const showEmpty = !image && !busy;

  return (
    <div className="flex gap-3">
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
          "relative aspect-square w-full max-w-[172px] shrink-0 overflow-hidden rounded-lg border bg-background",
          showEmpty && "cursor-pointer hover:bg-muted/50",
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
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image.img_url} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground/40">
            <ImageIcon className="size-7" />
          </div>
        )}
      </div>

      <div className="min-w-0">
        <p className="text-[13px] font-medium leading-none text-muted-foreground">{label}</p>
        {caption && (
          <p className="mt-0.5 text-xs text-muted-foreground">{caption}</p>
        )}
        {!busy && (
          <div className="mt-2 flex flex-col items-start gap-2">
            {image ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-[126px] bg-background"
                  onClick={pick}
                >
                  <Pencil className="size-4" />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-[126px]"
                  onClick={onDelete}
                >
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-[126px] bg-background"
                onClick={pick}
              >
                <Plus className="size-4" />
                Add image
              </Button>
            )}
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

export default ThumbnailUploader;
