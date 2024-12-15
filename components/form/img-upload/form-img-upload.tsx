"use client";

import {
  CldUploadWidget,
  CloudinaryUploadWidgetInstanceMethodOpenOptions,
  CloudinaryUploadWidgetSources,
} from "next-cloudinary";

import UploadedImg from "./uploaded-img";

import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Image } from "@prisma/client";
import { Label } from "@/components/shadcn/label";
import { useFormImgUpload } from "./use-form-img-upload";
import { buttonVariants } from "@/components/shadcn/button";

interface FormImgUploadProps {
  onGetUploadResult: (data: Image) => void;
  updateDeletedImage: (public_id: string) => void;
  initialImages: Image[];
  maxImage?: number;
  label?: string;
  isLoading?: boolean;
  max_file_size?: number;
}

const FormImgUpload = ({
  label,
  initialImages,
  isLoading,
  onGetUploadResult,
  updateDeletedImage,
  maxImage,
  max_file_size,
}: FormImgUploadProps) => {
  const { imageNumberLeft, maximumImage, onDeleteImage, onSuccessHandler } =
    useFormImgUpload({
      maxImage,
      initialImages,
      onGetUploadResult,
      updateDeletedImage,
    });

  const renderNoImage = (
    open: (
      widgetSource?: CloudinaryUploadWidgetSources,
      options?: CloudinaryUploadWidgetInstanceMethodOpenOptions
    ) => void
  ) => {
    const renderCondition = !initialImages || initialImages.length === 0;

    if (!renderCondition) return <></>;

    return (
      <div
        onClick={!isLoading ? () => open() : () => {}}
        className="w-full h-[25vh] border border-dashed bg-muted rounded-xl flex items-center justify-center cursor-pointer"
      >
        <button
          type="button"
          className={cn(
            buttonVariants({
              variant: "default",
            })
          )}
          onClick={() => open()}
          disabled={isLoading}
        >
          Upload images
        </button>
      </div>
    );
  };

  const renderHasImage = (
    open: (
      widgetSource?: CloudinaryUploadWidgetSources,
      options?: CloudinaryUploadWidgetInstanceMethodOpenOptions
    ) => void
  ) => {
    const renderCondition = !!initialImages && initialImages.length > 0;
    const imageLeft = maximumImage - initialImages.length;

    if (!renderCondition) return <></>;

    return (
      <div className="border border-dashed bg-muted rounded-xl p-3">
        <div className="flex flex-wrap items-center gap-6">
          {initialImages.map((img, id) => (
            <UploadedImg key={id} img={img} onDeleteImage={onDeleteImage} />
          ))}
          {!isLoading && imageLeft > 0 && (
            <div
              onClick={() => open()}
              className="cursor-pointer rounded-lg bg-foreground/80 text-background w-[200px] h-[200px] flex flex-col items-center justify-center overflow-hidden relative"
            >
              <Plus />
              <p>upload more</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCldWidget = () => (
    <CldUploadWidget
      onSuccess={onSuccessHandler}
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      options={{
        sources: ["local", "url"],
        clientAllowedFormats: ["png", "jpg", "jpeg", "gif", "svg"],
        maxFileSize: max_file_size || 3_000_000,
        multiple: maximumImage > 1,
        maxFiles: imageNumberLeft,
      }}
    >
      {({ open }) => {
        return (
          <>
            {renderNoImage(open)}
            {renderHasImage(open)}
          </>
        );
      }}
    </CldUploadWidget>
  );

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <Label className="text-sm font-semibold text-foreground/70">
          {label}
        </Label>
      )}
      {renderCldWidget()}
    </div>
  );
};

export default FormImgUpload;
