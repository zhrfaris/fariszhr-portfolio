"use client";

import { Image as ImageType } from "@prisma/client";

import { CARD_EXPORT_HINT, cldUrl } from "@/lib/landing";
import { useMediaUpload } from "@/components/dashboard/posts/use-media-upload";
import MediaSlot from "@/components/dashboard/posts/media-slot";

/**
 * One image of the landing page's hanging ID card (a face, or the band) as a
 * row: the slot on the left (same slot, upload flow and icon buttons as the
 * post form), its title and notes on the right.
 *
 * - "card": a portrait face, 120px wide at 12:19.
 * - "band": a horizontal strip, 80px tall, up to 240px wide (6:1 empty).
 */
const CardPhotoSlot = ({
  label,
  description,
  image,
  onChange,
  hint = `${CARD_EXPORT_HINT}. Photo only, it fills the whole card.`,
  shape = "card",
}: {
  label: string;
  description: string;
  image: ImageType | null;
  onChange: (image: ImageType | null) => void;
  hint?: string;
  shape?: "card" | "band";
}) => {
  const upload = useMediaUpload((img) => onChange(img));

  return (
    <div className="flex items-start gap-4">
      <div className="shrink-0">
        <MediaSlot
          name={label}
          image={image}
          upload={upload}
          accept=".png,.jpg,.jpeg,.webp,image/*"
          onFile={(file) => upload.start(file)}
          onRemove={() => onChange(null)}
          previewSrc={(url) => cldUrl(url, "w_600,c_limit,q_auto,f_auto")}
          {...(shape === "card"
            ? { emptyRatio: 12 / 19, className: "w-[120px]" }
            : { emptyRatio: 6, fixedHeight: 80, maxWidth: 240 })}
        />
      </div>
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-[13px] text-muted-foreground">{description}</p>
        <p className="text-[13px] text-tertiary-foreground">{hint}</p>
      </div>
    </div>
  );
};

export default CardPhotoSlot;
