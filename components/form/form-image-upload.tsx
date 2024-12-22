"use client";

import useCloudinary from "@/hooks/use-cloudinary";
import { CldUploadWidget } from "next-cloudinary";
import React, { forwardRef, useImperativeHandle } from "react";
import { Image as ImageType } from "@prisma/client";
import ImagePlaceholder from "../common/image-placeholder";
import { Label } from "../shadcn/label";

interface FormImageUploadProps {
  initialImage?: ImageType;
  label?: string;
}

export interface FormImageUploadHandle {
  image: ImageType | undefined;
  deleteUnusedImage: () => Promise<void>;
}

const FormImageUpload = forwardRef<FormImageUploadHandle, FormImageUploadProps>(
  ({ initialImage, label }, ref) => {
    const { currentImage, deleteUnUsedImages, onSuccessUploadImageHandler } =
      useCloudinary({
        initialImage,
      });

    useImperativeHandle(ref, () => ({
      deleteUnusedImage: deleteUnUsedImages,
      get image() {
        return currentImage;
      },
    }));

    return (
      <div className="w-full space-y-2">
        {label && (
          <Label className="text-sm font-semibold text-foreground/70">
            {label}
          </Label>
        )}
        <div className="w-full h-72 bg-muted rounded-sm">
          <CldUploadWidget
            onSuccess={onSuccessUploadImageHandler}
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
            options={{
              sources: ["local", "url"],
              clientAllowedFormats: ["png", "jpg", "jpeg", "gif", "svg"],
              maxFileSize: 3_000_000,
              multiple: false,
            }}
          >
            {({ open }) => (
              <ImagePlaceholder
                classNameWrapper="rounded-sm"
                classNameEditButton="size-8 rounded-sm bottom-auto left-auto top-4 right-4"
                img_url={currentImage?.img_url}
                img_url_placeholder={currentImage?.img_url_placeholder}
                onEdit={() => {
                  open();
                }}
              />
            )}
          </CldUploadWidget>
        </div>
      </div>
    );
  }
);

FormImageUpload.displayName = "FormImageUpload";

export default FormImageUpload;
