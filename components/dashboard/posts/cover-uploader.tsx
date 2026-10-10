"use client";

import { forwardRef, useRef, useState } from "react";
import { Image as ImageType } from "@prisma/client";
import { ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/shadcn/button";
import { cn } from "@/lib/utils";
import { useMediaUpload } from "./use-media-upload";
import { UploadErrorOverlay, UploadProgressBadge } from "./upload-overlay";

interface CoverUploaderProps {
  value: ImageType | null;
  onChange: (next: ImageType | null) => void;
  onOrphan: (publicIds: string[]) => void;
  error?: string;
}

/**
 * Full-width cover (header_image) uploader: a preview box with a full-width
 * "Add image" button below it, or Edit / Delete once a cover is set.
 */
const CoverUploader = forwardRef<HTMLDivElement, CoverUploaderProps>(
  function CoverUploader({ value, onChange, onOrphan, error }, ref) {
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
    const showEmpty = !value && !busy;

    return (
      <div ref={ref} tabIndex={-1} className="space-y-3 outline-none">
        <p className="text-sm font-semibold text-foreground">Cover image</p>
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
            "relative h-[172px] w-full overflow-hidden rounded-lg border bg-muted",
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
          ) : value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value.img_url} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground/40">
              <ImageIcon className="size-7" />
            </div>
          )}
        </div>

        {!busy &&
          (value ? (
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="bg-background"
                onClick={pick}
              >
                <Pencil className="size-4" />
                Edit
              </Button>
              <Button type="button" variant="ghost" onClick={remove}>
                <Trash2 className="size-4" />
                Delete
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full bg-background"
              onClick={pick}
            >
              <Plus className="size-4" />
              Add image
            </Button>
          ))}

        {error && <p className="text-sm text-destructive">{error}</p>}

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
);

export default CoverUploader;
