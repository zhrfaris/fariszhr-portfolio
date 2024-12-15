import cloudinary from "cloudinary";

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
