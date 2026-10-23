"use client";

import { forwardRef } from "react";
import { Image as ImageType } from "@prisma/client";

import { useMediaUpload } from "./use-media-upload";
import MediaSlot from "./media-slot";

interface CoverUploaderProps {
  value: ImageType | null;
  onChange: (next: ImageType | null) => void;
  onOrphan: (publicIds: string[]) => void;
  error?: string;
}

/** Full-width cover (header_image) slot, same pattern as the thumbnails. */
const CoverUploader = forwardRef<HTMLDivElement, CoverUploaderProps>(
  function CoverUploader({ value, onChange, onOrphan, error }, ref) {
    const upload = useMediaUpload((image) => {
      if (value?.public_id) onOrphan([value.public_id]);
      onChange(image);
    });

    const remove = () => {
      if (value?.public_id) onOrphan([value.public_id]);
      onChange(null);
    };

    return (
      <div ref={ref} tabIndex={-1} className="space-y-2 outline-none">
        <MediaSlot
          label="Cover image"
          image={value}
          upload={upload}
          accept=".png,.jpg,.jpeg,.gif,.svg,image/*"
          onFile={(file) => upload.start(file)}
          onRemove={remove}
          invalid={!!error}
          emptyRatio={16 / 9}
          // portfolio-styles.ts: the cover band is up to 500px tall and the
          // design frame 1440 wide (object-cover); at 2x that's 2880×1000.
          helper="2.88:1, recommended 2880×1000px. Used at the top of the case study page."
          className="w-full"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);

export default CoverUploader;
