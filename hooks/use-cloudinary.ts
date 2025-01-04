/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  CloudinaryUploadWidgetInfo,
  CloudinaryUploadWidgetResults,
} from "next-cloudinary";
import { Image as ImageType } from "@prisma/client";
import { imageUrlToBase64 } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

interface UseCloudinaryProps {
  initialImage?: ImageType;
}

// ??Further read
// upload cloudinary image using Fetch API: https://codepen.io/team/Cloudinary/pen/OJreJmz

const useCloudinary = (props?: UseCloudinaryProps) => {
  const { initialImage } = props || {};

  const [isLoading, setIsLoading] = useState(false);

  const [currentImage, setCurrentImage] = useState<ImageType | undefined>(
    initialImage
  );
  const [willDeleteImage, setWillDeleteImage] = useState<
    ImageType | undefined
  >();

  const onUploadCloudinaryImage = async (base64: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/image/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ base64 }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload item");
      }

      // console.log({ response });

      const data = await response.json();

      // console.log({ data });

      setCurrentImage(data.image);
    } catch (error) {
      console.log(error);
      toast.error(`Error uploading item: ${error}`);
    } finally {
      setIsLoading(false);
      toast.success("Image uploaded!");
    }
  };

  const onDeleteCloudinaryImage = async (
    public_id: string,
    option?: { onError?: (error: any) => void; onSuccess?: () => void }
  ) => {
    const { onError = () => {}, onSuccess = () => {} } = option || {};
    setIsLoading(true);

    try {
      const response = await fetch(`/api/image/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ public_id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      // console.log(response);
    } catch (error) {
      console.log(error);
      onError(error);
    } finally {
      setIsLoading(false);
      onSuccess();
    }
  };

  const deleteUnUsedImages = async () => {
    if (!willDeleteImage) return;

    toast.info("Deleting unused image...");
    await onDeleteCloudinaryImage(willDeleteImage?.public_id, {
      onError: (error) => {
        toast.error(`Error deleting item: ${error}`);
      },
      onSuccess: () => {
        toast.success("Unused image deleted!");
      },
    });
  };

  const deleteCurrentImage = async () => {
    if (!currentImage) return;

    toast.info("Deleting image...");
    await onDeleteCloudinaryImage(currentImage?.public_id, {
      onError: (error) => {
        toast.error(`Error deleting item: ${error}`);
      },
      onSuccess: () => {
        toast.success("image deleted!");
      },
    });
  };

  const onSuccessUploadImageHandler = async (
    results: CloudinaryUploadWidgetResults
  ) => {
    const { secure_url, thumbnail_url, width, height, format, public_id } =
      results.info as CloudinaryUploadWidgetInfo;

    const newImage: ImageType = {
      public_id,
      img_url: secure_url,
      img_url_thumbnail: thumbnail_url,
      img_width: width,
      img_height: height,
      img_url_placeholder: thumbnail_url,
      img_type: format,
    };

    try {
      const base64 = await imageUrlToBase64(newImage.img_url_thumbnail);
      newImage.img_url_placeholder = base64;
    } catch (error) {
      console.error("Error fetching or encoding image:", error);
    }

    if (!!currentImage?.public_id) {
      setWillDeleteImage(currentImage);
    }

    setCurrentImage(newImage);
  };

  return {
    isLoading,
    currentImage,
    onSuccessUploadImageHandler,
    onUploadCloudinaryImage,
    deleteUnUsedImages,
    deleteCurrentImage,
  };
};

export default useCloudinary;
