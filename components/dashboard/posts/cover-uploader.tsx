"use client";

import { useRef, useState } from "react";
import { Image as ImageType } from "@prisma/client";
import { ImageIcon, Plus } from "lucide-react";

import { Button } from "@/components/shadcn/button";
import { cn } from "@/lib/utils";
import {
  COVER_IMAGE,
  COVER_INNER,
  COVER_WRAPPER_BASE,
} from "@/components/portfolio-detail/portfolio-styles";
import { useMediaUpload } from "./use-media-upload";
import { UploadErrorOverlay, UploadProgressBadge } from "./upload-overlay";

interface CoverUploaderProps {
  value: ImageType | null;
  onChange: (next: ImageType | null) => void;
  onOrphan: (publicIds: string[]) => void;
  error?: string;
}

/**
 * Full-width cover (header_image) uploader for the Content tab. Mirrors the
 * live case-study cover band (height / background / object-fit) and adds the
 * drop-or-click empty state plus change / remove hover actions.
 */
export default function CoverUploader({
  value,
  onChange,
  onOrphan,
  error,
}: CoverUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const upload = useMediaUpload((image) => {
    if (value?.public_id) onOrphan([value.public_id]);
    onChange(image);
  });

  const pick = () => inputRef.current?.click();

  const remove = () => {
    if (value?.public_id) onOrphan([value.public_id]);
    onChange(null);
  };

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) upload.start(file);
  };

  const busy = upload.isUploading || upload.isError;

  return (
    <div>
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
        className={cn(
          COVER_WRAPPER_BASE,
          "group flex items-center justify-center overflow-hidden",
          dragOver && "ring-2 ring-inset ring-foreground/30"
        )}
      >
        {busy ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={upload.previewUrl}
              alt=""
              className={cn(COVER_IMAGE, "opacity-70")}
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
        ) : value ? (
          <>
            <div className={COVER_INNER}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value.img_url} alt="" className={COVER_IMAGE} />
            </div>
            <div className="absolute right-4 top-4 hidden items-center gap-2 group-hover:flex">
              <Button type="button" size="sm" variant="secondary" onClick={pick}>
                <Plus className="size-4" />
                Change cover
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={remove}
              >
                Remove
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <ImageIcon className="size-10 text-muted-foreground/40" />
            <p className="text-sm">Drop an image or click Add cover</p>
            <Button type="button" variant="outline" size="sm" onClick={pick}>
              <Plus className="size-4" />
              Add cover
            </Button>
          </div>
        )}
      </div>

      {error && <p className="px-6 pt-2 text-sm text-destructive">{error}</p>}

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
