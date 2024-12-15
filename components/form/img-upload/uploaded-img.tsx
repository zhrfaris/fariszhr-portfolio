"use client";

import { Button } from "@/components/shadcn/button";
import { Image as ImageType } from "@prisma/client";
import { Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

interface UploadedImgProps {
  img: ImageType;
  onDeleteImage: (id: string) => void;
}

const UploadedImg = ({ img, onDeleteImage }: UploadedImgProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  return (
    <div className="rounded-lg w-[200px] h-[200px] overflow-hidden relative">
      <Button
        onClick={() => onDeleteImage(img.public_id)}
        type="button"
        size="icon"
        className="absolute top-1 p-0 right-1 rounded-full cursor-pointer z-10 bg-red-100 hover:bg-red-200"
      >
        <Trash2 className="w-4 h-4 text-red-600" />
      </Button>
      {isLoading && (
        <Button
          type="button"
          size="icon"
          className="absolute bottom-1 p-0 right-1 rounded-full cursor-pointer animate-spin"
        >
          <Loader2 className="w-4 h-4" />
        </Button>
      )}
      {img.img_type && img.img_type === "svg" ? (
        <div className="relative size-full  bg-foreground/30">
          <Image
            src={img.img_url}
            alt=""
            fill
            blurDataURL={img.img_url_placeholder}
            placeholder="blur"
            onLoad={() => setIsLoading(false)}
          />
        </div>
      ) : (
        <Image
          src={img.img_url}
          alt=""
          // width={img.img_width}
          // height={img.img_height}
          blurDataURL={img.img_url_placeholder}
          placeholder="blur"
          onLoad={() => setIsLoading(false)}
          fill
          className="object-cover"
        />
      )}
    </div>
  );
};

export default UploadedImg;
