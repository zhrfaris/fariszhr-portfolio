"use client";

import { createCategory } from "@/actions/category/create";
import { Category } from "@/actions/category/get/types";
import { updateCategory } from "@/actions/category/update";
import { FormCreateComponentOnComboboxProps } from "@/components/form/form-combobox/form-combobox";
import FormInput from "@/components/form/form-input";
import { BasicFormProps } from "@/components/form/popover-form";
import { Button } from "@/components/shadcn/button";
import { useAction } from "@/hooks/use-action";
import React from "react";
import { toast } from "sonner";

interface CategoryFormProps
  extends BasicFormProps<Category>,
    FormCreateComponentOnComboboxProps {}

const CategoryForm = ({
  initialData,
  onSubmit,
  onSuccess,
}: CategoryFormProps) => {
  const {
    execute: executeCreate,
    fieldErrors: createFieldErrors,
    isLoading: createIsLoading,
  } = useAction(createCategory, {
    onProceed: () => {
      toast.loading("Creating category...", { id: "loading-create-category" });
    },
    onSuccess: async (data) => {
      toast.success("Category created!");
      if (!!onSuccess) {
        onSuccess(data.id);
        return;
      }
      if (onSubmit) onSubmit();
    },
    onComplete: () => {
      toast.dismiss("loading-create-category");
    },
  });

  const {
    execute: executeUpdate,
    fieldErrors: updateFieldErrors,
    isLoading: updateIsLoading,
  } = useAction(updateCategory, {
    onProceed: () => {
      toast.loading("Updating category...", { id: "loading-update-category" });
    },
    onSuccess: async () => {
      toast.success("Category updated!");
      if (onSubmit) onSubmit();
    },
    onComplete: () => {
      toast.dismiss("loading-update-category");
    },
  });

  const formAction = (formData: FormData) => {
    const name = formData.get("name") as string;

    if (initialData?.id) {
      executeUpdate({ id: initialData.id, name });
      return;
    }

    executeCreate({ name });
  };

  return (
    <form action={formAction} className="flex-1 space-y-6">
      <FormInput
        label="Name"
        id="name"
        defaultValue={initialData?.name}
        required={true}
        errors={initialData?.id ? updateFieldErrors : createFieldErrors}
      />
      <Button type="submit" disabled={createIsLoading || updateIsLoading}>
        Save
      </Button>
    </form>
  );
};

export default CategoryForm;
