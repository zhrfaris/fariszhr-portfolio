"use client";

import { Button } from "@/components/shadcn/button";
import { cn } from "@/lib/utils";
import { ImageIcon, Pen, Trash2 } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import React, { useEffect, useState } from "react";

interface ImagePlaceholderProps {
  img_url?: string | StaticImageData;
  img_url_placeholder?: string;
  alt?: string;
  className?: string;
  classNameWrapper?: string;
  classNameButtons?: string;
  quality?: number;
  width?: number;
  height?: number;
  onEdit?: () => void;
  onDelete?: () => Promise<void>;
}

const ImagePlaceholder = ({
  alt,
  img_url,
  className,
  classNameWrapper,
  classNameButtons,
  img_url_placeholder,
  quality = 75,
  width,
  height,
  onEdit,
  onDelete,
}: ImagePlaceholderProps) => {
  const [isMounted, setisMounted] = useState(false);

  useEffect(() => {
    if (!!isMounted) return;

    setisMounted(true);
  }, [isMounted]);

  const Buttons = () => {
    if (!isMounted) {
      return null;
    }

    return (
      <div
        className={cn(
          "absolute top-2 right-2 group-hover:flex gap-4 hidden",
          classNameButtons
        )}
      >
        {onEdit && (
          <Button
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              onEdit();
            }}
            className={cn(
              "bg-white text-black rounded-md mix-blend-difference hover:bg-white hover:text-black"
            )}
          >
            <Pen className="h-4 w-4" />
          </Button>
        )}
        {onDelete && img_url && (
          <Button
            size="icon"
            onClick={async (e) => {
              e.preventDefault();
              await onDelete();
            }}
            className={cn(
              "bg-red-500 text-white rounded-md hover:bg-bg-red-500 hover:text-white"
            )}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };

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
            fill={!width && !height}
            quality={quality}
            className={cn("object-contain w-full", className)}
            {...(width && height && { width, height })}
          />
          <Buttons />
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
          <Buttons />
        </>
      )}
    </div>
  );
};

export default ImagePlaceholder;
