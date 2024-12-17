"use client";

import { Button } from "@/components/shadcn/button";
import { cn } from "@/lib/utils";
import { ImageIcon, Pen } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import React, { useEffect, useState } from "react";

interface ImagePlaceholderProps {
  img_url?: string | StaticImageData;
  img_url_placeholder?: string;
  alt?: string;
  className?: string;
  classNameWrapper?: string;
  quality?: number;
  onEdit?: () => void;
}

const ImagePlaceholder = ({
  alt,
  img_url,
  className,
  classNameWrapper,
  img_url_placeholder,
  quality = 75,
  onEdit,
}: ImagePlaceholderProps) => {
  const [isMounted, setisMounted] = useState(false);

  useEffect(() => {
    if (!!isMounted) return;

    setisMounted(true);
  }, [isMounted]);

  return (
    <div
      className={cn(
        "w-full h-full bg-foreground/30 rounded-full relative group overflow-hidden",
        classNameWrapper
      )}
    >
      {img_url ? (
        <>
          <Image
            src={img_url}
            alt={alt || ""}
            blurDataURL={img_url_placeholder}
            placeholder={img_url_placeholder ? "blur" : undefined}
            fill
            quality={quality}
            className={cn("object-cover", className)}
          />
          {!!onEdit && isMounted && (
            <Button
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                onEdit();
              }}
              className="absolute bottom-0 inset-x-0 w-full bg-foreground/80 text-background hidden group-hover:flex rounded-none"
            >
              <Pen className="h-4 w-4" />
            </Button>
          )}
        </>
      ) : (
        <>
          <div
            className={cn(
              "size-full flex items-center justify-center",
              !!onEdit && "cursor-pointer"
            )}
            onClick={() => {
              if (!!onEdit && isMounted) {
                onEdit();
              }
            }}
          >
            <ImageIcon className="text-white size-12" />
          </div>
          {!!onEdit && isMounted && (
            <Button
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                onEdit();
              }}
              className="absolute bottom-0 inset-x-0 w-full group-hover:bg-black/80 text-background hidden group-hover:flex rounded-none"
            >
              <Pen className="h-4 w-4" />
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default ImagePlaceholder;
