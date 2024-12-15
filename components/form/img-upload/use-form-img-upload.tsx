import useCloudinary from "@/hooks/use-cloudinary";
import { imageUrlToBase64 } from "@/lib/utils";
import { Image } from "@prisma/client";
import {
  CloudinaryUploadWidgetInfo,
  CloudinaryUploadWidgetResults,
} from "next-cloudinary";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface UseFormImgUploadProps {
  onGetUploadResult: (data: Image) => void;
  updateDeletedImage: (public_id: string) => void;
  initialImages: Image[];
  maxImage?: number;
}

const MAX_IMAGE_PER_POST = process.env.NEXT_PUBLIC_MAX_IMG_PER_POST || "5";

export const useFormImgUpload = ({
  initialImages,
  onGetUploadResult,
  updateDeletedImage,
  maxImage,
}: UseFormImgUploadProps) => {
  const [maximumImage] = useState(maxImage ?? parseInt(MAX_IMAGE_PER_POST));
  const [imageNumberLeft, setImageNumberLeft] = useState<number>(
    maximumImage - initialImages.length
  );

  useEffect(() => {
    setImageNumberLeft(parseInt(MAX_IMAGE_PER_POST) - initialImages.length);
  }, [initialImages, imageNumberLeft]);

  const onSuccessHandler = async (results: CloudinaryUploadWidgetResults) => {
    const { secure_url, thumbnail_url, width, height, format, public_id } =
      results.info as CloudinaryUploadWidgetInfo;

    const newImage: Image = {
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
      return;
    }

    onGetUploadResult(newImage);
    toast.success("Image uploaded!");
  };

  const onDeleteImage = (public_id: string) => {
    updateDeletedImage(public_id);
  };

  return {
    maximumImage,
    imageNumberLeft,
    onDeleteImage,
    onSuccessHandler,
  };
};

export const useUtilityFormImgUpload = ({
  initialImages,
}: {
  initialImages: Image[];
}) => {
  const [images, setImages] = useState<Image[]>(initialImages || []);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  const { onDeleteCloudinaryImage } = useCloudinary();

  const onUploadImage = (image: Image) => {
    setImages((prev) => [...prev, image]);
  };

  const onDeleteImage = async (public_id: string) => {
    setImagesToDelete((imagesToDelete) => [...imagesToDelete, public_id]);
    setImages(images.filter((image) => image.public_id !== public_id));
  };

  const deleteUnusedImages = async () => {
    if (imagesToDelete.length === 0) return;

    toast.info("Deleting unused images...");

    const deleteImageTransactions = imagesToDelete.map((public_id) =>
      onDeleteCloudinaryImage(public_id, {
        onError: (error) => {
          toast.error(`Error deleting item: ${error}`);
        },
      })
    );

    await Promise.all(deleteImageTransactions);

    setImagesToDelete([]);
    toast.success("Successfully deleting unused Images");
  };

  return {
    images,
    imagesToDelete,
    onUploadImage,
    onDeleteImage,
    deleteUnusedImages,
  };
};
