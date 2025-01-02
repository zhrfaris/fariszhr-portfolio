"use client";

import useCloudinary from "@/hooks/use-cloudinary";
import { CldUploadWidget } from "next-cloudinary";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
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
      uploadWIthAPI = true,
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

    const [isMounted, setIsMounted] = useState(false);

    useImperativeHandle(ref, () => ({
      deleteUnusedImage: deleteUnUsedImages,
      get image() {
        return currentImage;
      },
    }));

    useEffect(() => {
      setIsMounted(true);

      return () => {
        setIsMounted(false);
      };
    }, []);

    const SdkUploader = () => {
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

          toast.loading("Uploading image...", { id: "loading-upload-image" });

          onUploadCloudinaryImage(`data:${file.type};base64,` + base64)
            .then(() => {
              toast.success("Image uploaded successfully");
            })
            .catch((error) => {
              console.error(error);
              toast.error("Failed to upload image");
            })
            .finally(() => {
              toast.dismiss("loading-upload-image");
            });
        }
      };

      return (
        <>
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
            onEdit={() => selectFile()}
            onDelete={showDeleteButton ? deleteCurrentImage : undefined}
            width={currentImage?.img_width}
            height={currentImage?.img_height}
          />
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
    };

    const WidgetUploader = () => {
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
          {({ open: openWidget }) => (
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
              onEdit={() => openWidget()}
              onDelete={showDeleteButton ? deleteCurrentImage : undefined}
              width={currentImage?.img_width}
              height={currentImage?.img_height}
            />
          )}
        </CldUploadWidget>
      );
    };

    if (!isMounted) return null;

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
          {uploadWIthAPI ? <SdkUploader /> : <WidgetUploader />}
        </div>
      </div>
    );
  }
);

FormImageUpload.displayName = "FormImageUpload";

export default FormImageUpload;
