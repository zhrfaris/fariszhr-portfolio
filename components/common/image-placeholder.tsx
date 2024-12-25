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
  classNameEditButton?: string;
  quality?: number;
  width?: number;
  height?: number;
  onEdit?: () => void;
}

const ImagePlaceholder = ({
  alt,
  img_url,
  className,
  classNameWrapper,
  classNameEditButton,
  img_url_placeholder,
  quality = 75,
  width,
  height,
  onEdit,
}: ImagePlaceholderProps) => {
  const [isMounted, setisMounted] = useState(false);

  useEffect(() => {
    if (!!isMounted) return;

    setisMounted(true);
  }, [isMounted]);

  const EditButton = () => {
    const showButton = !!onEdit && isMounted;

    if (!showButton) {
      return null;
    }

    return (
      <Button
        size="icon"
        onClick={(e) => {
          e.preventDefault();
          onEdit();
        }}
        className={cn(
          "absolute bottom-0 inset-x-0 w-full group-hover:bg-slate-700 text-background hidden group-hover:flex rounded-none group-hover:mix-blend-difference",
          classNameEditButton
        )}
      >
        <Pen className="h-4 w-4" />
      </Button>
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
          <EditButton />
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
          <EditButton />
        </>
      )}
    </div>
  );
};

export default ImagePlaceholder;
