"use client";

// import useCloudinary from "@/hooks/use-cloudinary";
// import { CldUploadWidget } from "next-cloudinary";
import React from "react";
import { Image as ImageType } from "@prisma/client";

interface FormImageUploadProps {
  initialImage?: ImageType;
  onDeleteUnUsedImages?: () => void;
}

const FormImageUpload = ({}: FormImageUploadProps) => {
  // const {
  //   currentImage: profileImage,
  //   deleteUnUsedImages,
  //   onSuccessUploadImageHandler,
  // } = useCloudinary({
  //   initialImage,
  // });

  // const deleteUnUsedImagesHandler = () => {

  // }

  return (
    // <CldUploadWidget
    //   onSuccess={onSuccessUploadImageHandler}
    //   uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
    //   options={{
    //     sources: ["local", "url"],
    //     clientAllowedFormats: ["png", "jpg", "jpeg", "gif", "svg"],
    //     maxFileSize: 3_000_000,
    //     multiple: false,
    //   }}
    // >
    //   {({ open }) => (
    //     <ImagePlaceholder
    //       img_url={profileImage?.img_url}
    //       img_url_placeholder={profileImage?.img_url_placeholder}
    //       onEdit={() => {
    //         open();
    //       }}
    //     />
    //   )}
    // </CldUploadWidget>
    <></>
  );
};

export default FormImageUpload;
