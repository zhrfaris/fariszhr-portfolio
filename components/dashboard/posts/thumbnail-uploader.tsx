"use client";

import { forwardRef } from "react";
import { Image as ImageType } from "@prisma/client";
import { toast } from "sonner";

import { deriveStaticFromGif, useMediaUpload } from "./use-media-upload";
import MediaSlot from "./media-slot";

export interface ThumbnailValue {
  image: ImageType | null;
  gif: ImageType | null;
  mobile: ImageType | null;
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
  if (v.mobile?.public_id) set.add(v.mobile.public_id);
  return set;
};

/** The image slot holds the GIF's derived first frame (same Cloudinary asset). */
export const isAutoFromGif = (v: ThumbnailValue) =>
  !!v.image && !!v.gif && v.image.public_id === v.gif.public_id;

/**
 * Two side-by-side slots: `thumbnail_image` (any image) and `thumbnail_gif`
 * (GIFs only). Uploading a GIF while the image slot is empty fills it with the
 * GIF's static first frame; deleting the GIF clears that derived frame too, but
 * leaves a separately uploaded image alone. A third slot, `thumbnail_mobile`,
 * holds the 3:2 crop the homepage cards use on mobile.
 *
 * The GIF slot is hidden for now (SHOW_GIF_SLOT); a saved GIF is kept as is
 * and still plays on the site. The visible pair shares one 3:2 frame so both
 * previews are the same size.
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
        <div className="grid items-start gap-4 sm:grid-cols-2">
          <ThumbnailSlot
            label="Desktop thumbnail"
            caption={autoFrame ? "Auto from GIF" : undefined}
            // showcase-card.tsx: a 200px square at md and up, so 400×400 at 2x.
            helper="1:1, recommended 400×400px. Used on desktop cards."
            image={value.image}
            emptyRatio={1}
            frameRatio={FRAME_RATIO}
            invalid={!!error}
            accept=".png,.jpg,.jpeg,.gif,.svg,image/*"
            onUploaded={(image) => commit({ ...value, image })}
            onDelete={() => commit({ ...value, image: null })}
          />
          {SHOW_GIF_SLOT && (
            <ThumbnailSlot
              label="Thumbnail GIF"
              image={value.gif}
              emptyRatio={ratioOf(value.image)}
              accept=".gif,image/gif"
              gifOnly
              onUploaded={(gif) =>
                commit({
                  ...value,
                  gif,
                  // Fill an empty image slot (or refresh a stale derived frame).
                  image:
                    !value.image || autoFrame
                      ? deriveStaticFromGif(gif)
                      : value.image,
                })
              }
              onDelete={() =>
                commit({
                  ...value,
                  gif: null,
                  image: autoFrame ? null : value.image,
                })
              }
            />
          )}
          <ThumbnailSlot
            label="Mobile thumbnail"
            helper="3:2, recommended 990×660px. Used on mobile cards. Falls back to Desktop thumbnail if empty."
            image={value.mobile}
            emptyRatio={MOBILE_RATIO}
            cropRatio={MOBILE_RATIO}
            accept=".png,.jpg,.jpeg,.gif,.svg,image/*"
            onUploaded={(mobile) => commit({ ...value, mobile })}
            onDelete={() => commit({ ...value, mobile: null })}
          />
        </div>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);

/** The homepage cards' image box on mobile (showcase-card.tsx). */
const MOBILE_RATIO = 3 / 2;

/** Every slot in the row draws in this frame, so they line up. */
const FRAME_RATIO = MOBILE_RATIO;

/** Thumbnail GIF is hidden from the form; flip to bring the slot back. */
const SHOW_GIF_SLOT = false;

/** An empty slot copies the other slot's shape; with both empty, square (the
 * shape every thumbnail so far has: 400×400 → 180×180). */
const ratioOf = (image: ImageType | null) =>
  image && image.img_width > 0 && image.img_height > 0
    ? image.img_width / image.img_height
    : 1;

function ThumbnailSlot({
  label,
  caption,
  helper,
  image,
  accept,
  gifOnly,
  invalid,
  emptyRatio,
  frameRatio,
  cropRatio,
  onUploaded,
  onDelete,
}: {
  label: string;
  caption?: string;
  /** Small hint under the slot. */
  helper?: string;
  image: ImageType | null;
  accept: string;
  gifOnly?: boolean;
  invalid?: boolean;
  emptyRatio: number;
  /** Fixed preview shape; the image letterboxes inside it. */
  frameRatio?: number;
  /** Fixed preview shape; the image is cropped to it like the live card. */
  cropRatio?: number;
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
      helper={helper}
      image={image}
      upload={upload}
      accept={accept}
      onFile={handleFile}
      onRemove={onDelete}
      invalid={invalid}
      // Full column width at the shared frame ratio, so the slots in the row
      // are the same size whatever their images; the hint sits below.
      emptyRatio={emptyRatio}
      frameRatio={frameRatio}
      cropRatio={cropRatio}
      className="w-full"
    />
  );
}

export default ThumbnailUploader;
