"use client";

import { Workplace } from "@/actions/workplace/get/types";
import ImagePlaceholder from "@/components/common/image-placeholder";
import FormInput from "@/components/form/form-input";
import FormWrapper from "@/components/form/form-wrapper";
import { CldUploadWidget } from "next-cloudinary";
import React from "react";
import useCloudinary from "@/hooks/use-cloudinary";
import { useAction } from "@/hooks/use-action";
import { createWorkplace } from "@/actions/workplace/create";
import { toast } from "sonner";
import { Button } from "@/components/shadcn/button";
import { useRouter } from "next/navigation";
import { updateWorkplace } from "@/actions/workplace/update";
import { FormCreateComponentOnComboboxProps } from "@/components/form/form-combobox/form-combobox";

interface WorkplaceFormProps extends FormCreateComponentOnComboboxProps {
  workplace?: Workplace;
}

const WorkplaceForm = ({ workplace, onSuccess }: WorkplaceFormProps) => {
  const router = useRouter();

  const {
    currentImage: workplaceImage,
    deleteUnUsedImages,
    onSuccessUploadImageHandler,
  } = useCloudinary({
    initialImage: workplace?.image || undefined,
  });

  const {
    execute: executeCreate,
    fieldErrors: createFieldErrors,
    isLoading: createIsLoading,
  } = useAction(createWorkplace, {
    onProceed: () => {
      toast.loading("Create workplace...", { id: "loading-create-workplace" });
    },
    onSuccess: async (data) => {
      toast.success("Workplace created!");
      await deleteUnUsedImages();

      if (!!onSuccess) {
        onSuccess(data.id);
        return;
      }

      router.push("/dashboard/workplaces");
    },
    onComplete: () => {
      toast.dismiss("loading-create-workplace");
    },
  });

  const {
    execute: executeUpdate,
    fieldErrors: updateFieldErrors,
    isLoading: updateIsLoading,
  } = useAction(updateWorkplace, {
    onProceed: () => {
      toast.loading("Update workplace...", { id: "loading-update-workplace" });
    },
    onSuccess: async () => {
      toast.success("Workplace updated!");
      await deleteUnUsedImages();
      router.push("/dashboard/workplaces");
    },
    onComplete: () => {
      toast.dismiss("loading-update-workplace");
    },
  });

  const formAction = (formData: FormData) => {
    const name = formData.get("name") as string;
    const url = formData.get("url") as string;

    if (!workplaceImage) {
      toast.error("Workplace image is required!");
      return;
    }

    if (workplace?.id) {
      executeUpdate({
        id: workplace.id,
        name,
        url,
        image: {
          ...workplaceImage,
          img_type: workplaceImage?.img_type,
        },
      });
      return;
    }

    executeCreate({
      name,
      url,
      image: {
        ...workplaceImage,
        img_type: workplaceImage?.img_type,
      },
    });
  };

  return (
    <div className="flex flex-col @md:flex-row gap-4 @md:gap-8 @md:items-start">
      <div className="size-56 bg-muted rounded-sm flex items-center justify-center">
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
              className="object-contain p-4"
              img_url={workplaceImage?.img_url}
              img_url_placeholder={workplaceImage?.img_url_placeholder}
              onEdit={() => {
                open();
              }}
            />
          )}
        </CldUploadWidget>
      </div>
      <form action={formAction} className="flex-1 space-y-6 @container">
        <FormWrapper>
          <FormInput
            label="Name"
            id="name"
            defaultValue={workplace?.name}
            required={true}
            errors={workplace?.id ? createFieldErrors : updateFieldErrors}
          />
        </FormWrapper>
        <FormWrapper>
          <FormInput
            label="Workplace Website / Social URL"
            id="url"
            defaultValue={workplace?.url || ""}
            errors={workplace?.id ? createFieldErrors : updateFieldErrors}
          />
        </FormWrapper>
        <Button type="submit" disabled={createIsLoading || updateIsLoading}>
          Save
        </Button>
      </form>
    </div>
  );
};

export default WorkplaceForm;
