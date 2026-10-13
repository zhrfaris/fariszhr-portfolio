"use client";

import { Button } from "@/components/shadcn/button";
import { cn } from "@/lib/utils";
import { ImagePlus, RefreshCw, Trash2 } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import React, { useEffect, useState } from "react";
import AlertDialogWrapper from "../wrappers/alert-dialog-wrapper";
import { IconAction } from "../dashboard/icon-action";

interface ImagePlaceholderProps {
  img_url?: string | StaticImageData;
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
  quality = 75,
  width,
  height,
  onEdit,
  onDelete,
}: ImagePlaceholderProps) => {
  const deleteImageButtonRef = React.useRef<HTMLButtonElement>(null);
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
      // Same as the post form's image slots: icon buttons stacked top-right.
      <div
        className={cn(
          "absolute right-2 top-2 z-10 flex flex-col gap-1.5",
          classNameButtons
        )}
      >
        {onEdit && (
          <IconAction
            aria-label="Replace image"
            onClick={(e) => {
              e.preventDefault();
              onEdit();
            }}
          >
            <RefreshCw />
          </IconAction>
        )}
        {onDelete && img_url && (
          <>
            <AlertDialogWrapper
              header={`Delete Image?`}
              description={`You will permanently delete the image, this action can not be undone!`}
              proceedHandler={() => {
                deleteImageButtonRef?.current?.click();
              }}
            >
              <IconAction aria-label="Remove image" destructive>
                <Trash2 />
              </IconAction>
            </AlertDialogWrapper>
            <Button
              ref={deleteImageButtonRef}
              size="icon"
              className="hidden"
              onClick={async (e) => {
                e.preventDefault();
                await onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "relative size-full overflow-hidden rounded-md bg-muted",
        classNameWrapper
      )}
    >
      {img_url ? (
        <>
          <Image
            src={img_url}
            alt={alt || ""}
            fill={!width && !height}
            quality={quality}
            className={cn("size-full object-contain", className)}
            {...(width && height && { width, height })}
          />
          <Buttons />
        </>
      ) : (
        <>
          <div
            className={cn(
              "flex size-full flex-col items-center justify-center gap-2 text-muted-foreground",
              !!onEdit && "cursor-pointer hover:bg-secondary"
            )}
            onClick={() => {
              if (!!onEdit && isMounted) {
                onEdit();
              }
            }}
          >
            <ImagePlus className="size-5" />
            <span className="text-[13px]">Add image</span>
          </div>
        </>
      )}
    </div>
  );
};

export default ImagePlaceholder;
