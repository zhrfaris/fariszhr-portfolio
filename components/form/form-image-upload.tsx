"use client";

import useCloudinary from "@/hooks/use-cloudinary";
import {
  CldUploadWidget,
  CloudinaryUploadWidgetInstanceMethodOpenOptions,
  CloudinaryUploadWidgetSources,
} from "next-cloudinary";
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Image as ImageType } from "@prisma/client";
import ImagePlaceholder from "../common/image-placeholder";
import { Label } from "../shadcn/label";
import { cn, convertFileToBase64 } from "@/lib/utils";
import { toast } from "sonner";

interface FormImageUploadProps {
  initialImage?: ImageType;
  label?: string;
  showDeleteButton?: boolean;
  className?: string;
  classNameButtons?: string;
  classNameWidgetWrapper?: string;
  uploadWIthAPI?: boolean;
}

export interface FormImageUploadHandle {
  image: ImageType | undefined;
  deleteUnusedImage: () => Promise<void>;
}

const FormImageUpload = forwardRef<FormImageUploadHandle, FormImageUploadProps>(
  (
    {
      initialImage,
      label,
      showDeleteButton,
      className,
      classNameButtons,
      classNameWidgetWrapper,
      uploadWIthAPI,
    },
    ref
  ) => {
    const {
      currentImage,
      deleteUnUsedImages,
      deleteCurrentImage,
      onUploadCloudinaryImage,
      onSuccessUploadImageHandler,
    } = useCloudinary({
      initialImage,
    });

    useImperativeHandle(ref, () => ({
      deleteUnusedImage: deleteUnUsedImages,
      get image() {
        return currentImage;
      },
    }));

    const WidgetWrapper = ({
      children,
    }: {
      children: (props: {
        open: (
          widgetSource?: CloudinaryUploadWidgetSources,
          options?: CloudinaryUploadWidgetInstanceMethodOpenOptions
        ) => void;
      }) => React.ReactNode;
    }) => {
      const inputFileRef = useRef<HTMLInputElement>(null);

      const selectFile = () => {
        inputFileRef.current?.click();
      };

      const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          if (file.size > 3_000_000) {
            toast.error("File size must be less than 3MB");
            return;
          }

          const base64 = await convertFileToBase64(file);

          if (base64.length === 0) {
            return;
          }

          onUploadCloudinaryImage(`data:${file.type};base64,` + base64);
        }
      };

      if (uploadWIthAPI) {
        return (
          <>
            {children({ open: selectFile })}
            <input
              ref={inputFileRef}
              onChange={onFileChange}
              type="file"
              name="img_url"
              className="hidden"
              accept=".png, .jpg, .jpeg, .gif, .svg"
            />
          </>
        );
      } else {
        return (
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
              <>
                {typeof children === "function" ? children({ open }) : children}
              </>
            )}
          </CldUploadWidget>
        );
      }
    };

    return (
      <div className="w-full space-y-2">
        {label && (
          <Label className="text-sm font-semibold text-foreground/70">
            {label}
          </Label>
        )}
        <div
          className={cn(
            "w-full bg-muted rounded-md border border-input",
            currentImage?.img_url ? "min-h-72" : "h-72",
            className
          )}
        >
          <WidgetWrapper>
            {({ open }) => (
              <ImagePlaceholder
                classNameWrapper={cn(
                  "rounded-sm",
                  currentImage?.img_url && "h-fit",
                  classNameWidgetWrapper
                )}
                classNameButtons={cn(
                  "size-8 rounded-sm bottom-auto left-auto top-4 right-4",
                  classNameButtons
                )}
                img_url={currentImage?.img_url}
                img_url_placeholder={currentImage?.img_url_placeholder}
                onEdit={() => open()}
                onDelete={showDeleteButton ? deleteCurrentImage : undefined}
                width={currentImage?.img_width}
                height={currentImage?.img_height}
              />
            )}
          </WidgetWrapper>
          {/* <CldUploadWidget
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
                classNameWrapper={cn(
                  "rounded-sm",
                  currentImage?.img_url && "h-fit",
                  classNameWidgetWrapper
                )}
                classNameButtons={cn(
                  "size-8 rounded-sm bottom-auto left-auto top-4 right-4",
                  classNameButtons
                )}
                img_url={currentImage?.img_url}
                img_url_placeholder={currentImage?.img_url_placeholder}
                onEdit={() => open()}
                onDelete={showDeleteButton ? deleteCurrentImage : undefined}
                width={currentImage?.img_width}
                height={currentImage?.img_height}
              />
            )}
          </CldUploadWidget> */}
        </div>
      </div>
    );
  }
);

FormImageUpload.displayName = "FormImageUpload";

export default FormImageUpload;
