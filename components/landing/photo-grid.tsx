"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { PublicGalleryPhoto } from "@/actions/gallery/get/types";
import { cldUrl } from "@/lib/landing";
import styles from "./landing.module.css";
import PhotoViewer, { printSource } from "./photo-viewer";
import { buildZine } from "./zine";
import { warmPhotos } from "./zine-faces";

/** Lets a photo's entrance run (landing.module.css) once its image is in. */
const markShown = (img: HTMLImageElement) =>
  img.closest("[data-photo-index]")?.setAttribute("data-shown", "");

const PhotoGrid = ({ photos }: { photos: PublicGalleryPhoto[] }) => {
  const [open, setOpen] = useState<number | null>(null);
  const zine = useMemo(
    () =>
      buildZine(
        photos.map((p) => ({ width: p.image.img_width, height: p.image.img_height }))
      ),
    [photos]
  );

  // Images that finished before hydration never fire onLoad here.
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    gridRef.current
      ?.querySelectorAll<HTMLImageElement>("img")
      .forEach((img) => img.complete && markShown(img));
  }, [photos]);

  if (photos.length === 0) {
    return (
      <p className={styles.empty}>
        Photos are on their way. Check back soon.
      </p>
    );
  }

  return (
    <>
      <div className={styles.photoGrid} ref={gridRef} data-photo-grid="">
        {photos.map((photo, index) => {
          const { img_url, img_width, img_height } = photo.image;
          const ratio = img_width && img_height ? img_width / img_height : 1.5;
          return (
            <button
              key={photo.id}
              type="button"
              className={styles.photo}
              data-photo-index={index}
              style={
                {
                  "--ratio": ratio.toFixed(4),
                  "--i6": index % 6,
                } as React.CSSProperties
              }
              // Start fetching before the click lands: the print the viewer
              // opens on, then what the book behind it will draw.
              onPointerDown={() => {
                const print = new Image();
                print.src = printSource(photo);
                print.decode?.().catch(() => {});
                const page = zine.pages[zine.pageOf[index]];
                warmPhotos((page?.photos ?? [index]).map((i) => photos[i]));
              }}
              onClick={() => setOpen(index)}
              aria-label={`Open photo ${index + 1} of ${photos.length}`}
            >
              <i aria-hidden />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cldUrl(img_url, "h_300,c_limit,q_auto,f_auto")}
                srcSet={`${cldUrl(img_url, "h_300,c_limit,q_auto,f_auto")} 1x, ${cldUrl(img_url, "h_480,c_limit,q_auto,f_auto")} 2x`}
                alt=""
                loading="lazy"
                decoding="async"
                onLoad={(e) => markShown(e.currentTarget)}
                onError={(e) => markShown(e.currentTarget)}
                width={img_width || undefined}
                height={img_height || undefined}
              />
            </button>
          );
        })}
      </div>
      <PhotoViewer
        photos={photos}
        openAt={open}
        onClose={() => setOpen(null)}
      />
    </>
  );
};

export default PhotoGrid;
