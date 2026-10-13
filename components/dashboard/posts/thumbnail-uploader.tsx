"use client";

import { forwardRef } from "react";
import { Image as ImageType } from "@prisma/client";
import { toast } from "sonner";

import { deriveStaticFromGif, useMediaUpload } from "./use-media-upload";
import MediaSlot from "./media-slot";

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
        <div className="flex flex-wrap items-start gap-4">
          <ThumbnailSlot
            label="Thumbnail image"
            caption={autoFrame ? "Auto from GIF" : undefined}
            image={value.image}
            emptyRatio={ratioOf(value.gif)}
            invalid={!!error}
            accept=".png,.jpg,.jpeg,.gif,.svg,image/*"
            onUploaded={(image) => commit({ ...value, image })}
            onDelete={() => commit({ ...value, image: null })}
          />
          <ThumbnailSlot
            label="Thumbnail GIF"
            image={value.gif}
            emptyRatio={ratioOf(value.image)}
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

/** An empty slot copies the other slot's shape; with both empty, square (the
 * shape every thumbnail so far has: 400×400 → 180×180). */
const ratioOf = (image: ImageType | null) =>
  image && image.img_width > 0 && image.img_height > 0
    ? image.img_width / image.img_height
    : 1;

function ThumbnailSlot({
  label,
  caption,
  image,
  accept,
  gifOnly,
  invalid,
  emptyRatio,
  onUploaded,
  onDelete,
}: {
  label: string;
  caption?: string;
  image: ImageType | null;
  accept: string;
  gifOnly?: boolean;
  invalid?: boolean;
  emptyRatio: number;
  onUploaded: (image: ImageType) => void;
  onDelete: () => void;
}) {
  const upload = useMediaUpload((img) => onUploaded(img));

  const handleFile = (file: File) => {
    if (gifOnly && file.type !== "image/gif") {
      toast.error("Thumbnail GIF must be a .gif file");
      return;
    }
    upload.start(file);
  };

  return (
    <MediaSlot
      label={label}
      aside={caption}
      image={image}
      upload={upload}
      accept={accept}
      onFile={handleFile}
      onRemove={onDelete}
      invalid={invalid}
      // Both slots 180px tall and top-aligned; the width follows the image
      // (empty: the other slot's shape, else square), up to 360.
      emptyRatio={emptyRatio}
      fixedHeight={180}
      maxWidth={360}
      className="max-w-full"
    />
  );
}

export default ThumbnailUploader;
