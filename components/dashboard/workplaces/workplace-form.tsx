"use client";

import { Workplace } from "@/actions/workplace/get/types";
import FormInput from "@/components/form/form-input";
import FormWrapper from "@/components/form/form-wrapper";
import React, { useRef } from "react";
import { useAction } from "@/hooks/use-action";
import { createWorkplace } from "@/actions/workplace/create";
import { toast } from "sonner";
import { Button } from "@/components/shadcn/button";
import { useRouter } from "next/navigation";
import { updateWorkplace } from "@/actions/workplace/update";
import { FormCreateComponentOnComboboxProps } from "@/components/form/form-combobox/form-combobox";
import FormImageUpload, {
  FormImageUploadHandle,
} from "@/components/form/form-image-upload";

interface WorkplaceFormProps extends FormCreateComponentOnComboboxProps {
  workplace?: Workplace;
}

const WorkplaceForm = ({
  workplace,
  essential,
  onSuccess,
}: WorkplaceFormProps) => {
  const router = useRouter();

  const workplaceImageRef = useRef<FormImageUploadHandle>(null);

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
      await workplaceImageRef.current?.deleteUnusedImage();

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
      await workplaceImageRef.current?.deleteUnusedImage();
      router.push("/dashboard/workplaces");
    },
    onComplete: () => {
      toast.dismiss("loading-update-workplace");
    },
  });

  const formAction = (formData: FormData) => {
    const name = formData.get("name") as string;
    const url = formData.get("url") as string;

    const workplaceImage = workplaceImageRef.current?.image;

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
      <form action={formAction} className="flex-1 space-y-6 @container">
        <FormWrapper>
          <FormImageUpload
            ref={workplaceImageRef}
            label="Workplace Logo"
            initialImage={workplace?.image || undefined}
            className="h-fit min-h-0 p-4 max-w-40"
            classNameWidgetWrapper="overflow-visible"
            classNameButtons="-top-4 -right-16 flex"
            uploadWIthAPI={essential}
          />
        </FormWrapper>
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
