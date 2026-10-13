"use client";

import { Workplace } from "@/actions/workplace/get/types";
import FormInput from "@/components/form/form-input";
import React, { useRef } from "react";
import { useAction } from "@/hooks/use-action";
import { createWorkplace } from "@/actions/workplace/create";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/shadcn/button";
import Link from "next/link";
import { SectionCard } from "@/components/dashboard/section-card";
import {
  PAGE_SHELL,
  PageColumn,
  StickyActionBar,
} from "@/components/dashboard/page-layout";
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
    <form action={formAction} className={PAGE_SHELL}>
      <PageColumn>
        <SectionCard
          icon="workplace"
          title="Workplace"
          description="The company's logo, name, and website. Case studies you tag with it show its logo."
        >
          <FormImageUpload
            ref={workplaceImageRef}
            label="Logo"
            initialImage={workplace?.image || undefined}
            className="h-36 w-72 max-w-full p-4"
            uploadWIthAPI={essential}
          />
          <FormInput
            label="Name"
            id="name"
            defaultValue={workplace?.name}
            required={true}
            errors={workplace?.id ? createFieldErrors : updateFieldErrors}
          />
          <FormInput
            label="Website or social link"
            id="url"
            defaultValue={workplace?.url || ""}
            errors={workplace?.id ? createFieldErrors : updateFieldErrors}
          />
        </SectionCard>
      </PageColumn>

      <StickyActionBar>
        <Link
          href="/dashboard/workplaces"
          className={buttonVariants({ variant: "ghost" })}
        >
          Cancel
        </Link>
        <Button type="submit" disabled={createIsLoading || updateIsLoading}>
          {workplace?.id ? "Save changes" : "Create workplace"}
        </Button>
      </StickyActionBar>
    </form>
  );
};

export default WorkplaceForm;
