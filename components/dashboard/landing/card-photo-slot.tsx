"use client";

import { useRef, useState } from "react";
import { Image as ImageType } from "@prisma/client";
import { ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/shadcn/button";
import { cn } from "@/lib/utils";
import { CARD_EXPORT_HINT, cldUrl } from "@/lib/landing";
import { useMediaUpload } from "@/components/dashboard/posts/use-media-upload";
import {
  UploadErrorOverlay,
  UploadProgressBadge,
} from "@/components/dashboard/posts/upload-overlay";

/**
 * One image of the landing page's hanging ID card (a face, or the band).
 * Same upload flow as the post thumbnail slots (shared upload manager,
 * progress badge, retry), previewed in the image's own shape with the export
 * size spelled out.
 */
const CardPhotoSlot = ({
  label,
  description,
  image,
  onChange,
  hint = `${CARD_EXPORT_HINT}. Photo only, it fills the whole card.`,
  previewClassName = "aspect-[12/19] w-[150px]",
}: {
  label: string;
  description: string;
  image: ImageType | null;
  onChange: (image: ImageType | null) => void;
  hint?: string;
  previewClassName?: string;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const upload = useMediaUpload((img) => onChange(img));

  const pick = () => inputRef.current?.click();
  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) upload.start(file);
  };

  const busy = upload.isUploading || upload.isError;
  const showEmpty = !image && !busy;

  return (
    <div className="flex gap-4">
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
          "relative shrink-0 overflow-hidden rounded-xl border bg-muted",
          previewClassName,
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
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cldUrl(image.img_url, "w_400,c_limit,q_auto,f_auto")}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground/40">
            <ImageIcon className="size-7" />
          </div>
        )}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        {!busy && (
          <div className="mt-3 flex flex-col items-start gap-2">
            {image ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-[126px] bg-background"
                  onClick={pick}
                >
                  <Pencil className="size-4" />
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-[126px]"
                  onClick={() => onChange(null)}
                >
                  <Trash2 className="size-4" />
                  Remove
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
                Add photo
              </Button>
            )}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,image/*"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
};

export default CardPhotoSlot;
