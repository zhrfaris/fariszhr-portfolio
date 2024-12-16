"use client";

import { User } from "@/actions/user/get/type";
import { updateUser } from "@/actions/user/update";
import FormInput from "@/components/form/form-input";
import FormTextarea from "@/components/form/form-textarea";
import FormWrapper from "@/components/form/form-wrapper";
import { Button } from "@/components/shadcn/button";
import { Separator } from "@/components/shadcn/separator";
import { useAction } from "@/hooks/use-action";
import {
  CldUploadWidget,
  CloudinaryUploadWidgetInfo,
  CloudinaryUploadWidgetResults,
} from "next-cloudinary";
import { toast } from "sonner";
import { Image as ImageType } from "@prisma/client";
import { imageUrlToBase64 } from "@/lib/utils";
import { useState } from "react";
import useCloudinary from "@/hooks/use-cloudinary";
import ImagePlaceholder from "@/components/common/image-placeholder";

const ProfileForm = ({ user }: { user: User }) => {
  const [profileImage, setProfileImage] = useState<ImageType | undefined>(
    user?.photo ?? undefined
  );
  const [willDeleteImage, setWillDeleteImage] = useState<
    ImageType | undefined
  >();

  const { onDeleteCloudinaryImage } = useCloudinary();

  const { execute, fieldErrors, isLoading } = useAction(updateUser, {
    onProceed: () => {
      toast.loading("Updating profile...", { id: "loading-update-profile" });
    },
    onSuccess: async () => {
      toast.success("Profile updated!");

      if (!!willDeleteImage) {
        toast.info("Deleting unused profile image...");
        await onDeleteCloudinaryImage(willDeleteImage?.public_id, {
          onError: (error) => {
            toast.error(`Error deleting item: ${error}`);
          },
          onSuccess: () => {
            toast.success("Unused profile image deleted!");
          },
        });
      }
    },
    onComplete: () => {
      toast.dismiss("loading-update-profile");
    },
  });

  const formAction = (formData: FormData) => {
    const name = formData.get("name") as string;
    const occupation = formData.get("occupation") as string;
    const tagline = formData.get("tagline") as string;
    const email = formData.get("email") as string;
    const linkedin_url = formData.get("linkedin_url") as string;
    const cv_url = formData.get("cv_url") as string;
    const deck_intro_url = formData.get("deck_intro_url") as string;

    if (!user) {
      toast.error("Unauthenticated!");
      return;
    }

    execute({
      id: user?.id,
      name,
      occupation,
      tagline,
      email,
      linkedin_url,
      cv_url,
      deck_intro_url,
      photo: profileImage
        ? { ...profileImage, img_type: profileImage?.img_type ?? undefined }
        : undefined,
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

    if (!!profileImage?.public_id) {
      setWillDeleteImage(profileImage);
    }

    setProfileImage(newImage);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-8 md:items-start">
      <div className="size-56 rounded-full bg-muted flex items-center justify-center">
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
              img_url={profileImage?.img_url}
              img_url_placeholder={profileImage?.img_url_placeholder}
              onEdit={() => {
                open();
              }}
            />
          )}
        </CldUploadWidget>
      </div>
      <form action={formAction} className="flex-1 space-y-6">
        <FormWrapper>
          <FormInput
            label="Name"
            id="name"
            defaultValue={user?.name}
            required={true}
            errors={fieldErrors}
          />
          <FormInput
            label="Occupation"
            id="occupation"
            defaultValue={user?.occupation}
            required={true}
            errors={fieldErrors}
          />
        </FormWrapper>
        <FormWrapper>
          <FormTextarea
            label="Tagline"
            id="tagline"
            defaultValue={user?.tagline}
            required={true}
            errors={fieldErrors}
          />
          <FormInput
            label="Email"
            id="email"
            type="email"
            defaultValue={user?.email}
            required={true}
            errors={fieldErrors}
          />
        </FormWrapper>
        <Separator />
        <FormWrapper>
          <FormInput
            label="CV url"
            id="cv_url"
            defaultValue={user?.cv_url || ""}
            errors={fieldErrors}
          />
          <FormInput
            label="Deck intro url"
            id="deck_intro_url"
            defaultValue={user?.deck_intro_url || ""}
            errors={fieldErrors}
          />
        </FormWrapper>
        <FormWrapper>
          <FormInput
            label="LinkedIn url"
            id="linkedin_url"
            defaultValue={user?.linkedin_url || ""}
            errors={fieldErrors}
          />
        </FormWrapper>
        <Button type="submit" disabled={isLoading}>
          Save
        </Button>
      </form>
    </div>
  );
};

export default ProfileForm;
