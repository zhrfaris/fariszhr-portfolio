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

interface WorkplaceFormProps {
  workplace?: Workplace;
}

const WorkplaceForm = ({ workplace }: WorkplaceFormProps) => {
  const router = useRouter();

  const {
    currentImage: workplaceImage,
    deleteUnUsedImages,
    onSuccessUploadImageHandler,
  } = useCloudinary({
    initialImage: workplace?.image || undefined,
  });

  const { execute, fieldErrors, isLoading } = useAction(createWorkplace, {
    onProceed: () => {
      toast.loading("Create workplace...", { id: "loading-create-workplace" });
    },
    onSuccess: async () => {
      toast.success("Workplace created!");
      await deleteUnUsedImages();
      router.push("/dashboard/workplaces");
    },
    onComplete: () => {
      toast.dismiss("loading-create-workplace");
    },
  });

  const formAction = (formData: FormData) => {
    const name = formData.get("name") as string;
    const url = formData.get("url") as string;

    if (!workplaceImage) {
      toast.error("Workplace image is required!");
      return;
    }

    execute({
      name,
      url,
      image: {
        ...workplaceImage,
        img_type: workplaceImage?.img_type ?? undefined,
      },
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-8 md:items-start">
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
      <form action={formAction} className="flex-1 space-y-6">
        <FormWrapper>
          <FormInput
            label="Name"
            id="name"
            defaultValue={workplace?.name}
            required={true}
            errors={fieldErrors}
          />
        </FormWrapper>
        <FormWrapper>
          <FormInput
            label="Workplace Website / Social URL"
            id="url"
            defaultValue={workplace?.url || ""}
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

export default WorkplaceForm;
