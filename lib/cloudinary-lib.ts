import cloudinary from "cloudinary";
import { toast } from "sonner";
import { Image as ImageType } from "@prisma/client";
import { imageUrlToBase64 } from "./utils";

export type CldImageUploadFetchResponse = {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: [];
  pages: number;
  bytes: number;
  type: string;
  etag: string;
  placeholder: false;
  url: string;
  secure_url: string;
  asset_folder: string;
  display_name: string;
  image_metadata: {
    JFIFVersion: string;
    ResolutionUnit: string;
    XResolution: string;
    YResolution: string;
    Colorspace: string;
    DPI: string;
  };
  illustration_score: number;
  semi_transparent: boolean;
  grayscale: boolean;
  original_filename: string;
  eager: [
    {
      transformation: string;
      width: number;
      height: number;
      bytes: number;
      format: string;
      url: string;
      secure_url: string;
    },
    {
      transformation: string;
      width: number;
      height: number;
      bytes: number;
      format: string;
      url: string;
      secure_url: string;
    }
  ];
  api_key: string;
};

/**
 * Initialize Cloudinary with the NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET environment variables.
 * Should be called on server side before using the Cloudinary library.
 * [ONLY used in server side (API)]
 */
export const initializeCloudinary = () => {
  cloudinary.v2.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
};

/**
 * Delete one or more images from Cloudinary [ONLY used in server side (API)].
 *
 * @param {string[]} public_ids - List of public IDs of images to delete.
 * @param {Object} [optional] - Optional options.
 * @param {Function} [optional.callback] - Function to call with the result of the deletion.
 * @returns {Promise<any>|void} - Promise with the result of the deletion, or nothing if a callback is provided.
 */
export const destroyCloudinaryImage = (
  public_ids: string[],
  optional?: { callback?: (result: unknown) => void }
) => {
  const { callback = (result: unknown) => console.log(result) } =
    optional || {};

  cloudinary.v2.api
    .delete_resources(public_ids, {
      type: "upload",
      resource_type: "image",
    })
    .then((result) => callback(result));
};

// https://cloudinary.com/documentation/image_upload_api_reference#upload_response
export const uploadCloudinaryImage = async (filePath: string) => {
  const upload_preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!filePath) {
    toast.error("filePath is required");
    return;
  }

  if (!upload_preset) {
    toast.error("upload_preset is required");
    return;
  }

  try {
    const response: CldImageUploadFetchResponse =
      await cloudinary.v2.uploader.unsigned_upload(filePath, upload_preset, {
        sources: ["local", "url"],
        clientAllowedFormats: ["png", "jpg", "jpeg", "gif", "svg"],
        maxFileSize: 3_000_000,
        multiple: false,
      });

    const image: ImageType = {
      public_id: response.public_id,
      img_url: response.secure_url,
      img_url_thumbnail: response.secure_url,
      img_width: response.width,
      img_height: response.height,
      img_url_placeholder: response.secure_url,
      img_type: response.format,
    };

    try {
      const base64 = await imageUrlToBase64(image.img_url_thumbnail);
      image.img_url_placeholder = base64;
    } catch (error) {
      console.error("Error fetching or encoding image:", error);
    }

    return image;
  } catch (error) {
    toast.error("Upload image failed");
    throw error;
  }
};
