"use client";

import { createPost } from "@/actions/post/create";
import { Post } from "@/actions/post/get/types";
import { updatePost } from "@/actions/post/update";
import FormInput from "@/components/form/form-input";
import FormWrapper from "@/components/form/form-wrapper";
import { useAction } from "@/hooks/use-action";
import { Status } from "@prisma/client";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { CreatePost } from "@/actions/post/create/schema";
import { Button } from "@/components/shadcn/button";
import FormImageUpload, {
  FormImageUploadHandle,
} from "@/components/form/form-image-upload";
import FormTextarea from "@/components/form/form-textarea";
import ListPostSection from "./list-post-section";
import { usePostForm } from "@/hooks/use-post-form";
import FormCombobox from "@/components/form/form-combobox/form-combobox";
import { getCategoriesComboboxAction } from "@/actions/category/get-list";
import CategoryForm from "../categories/category-form";
import { unassignPostFromCategory } from "@/actions/category/unassign-post";
import { getWorkplacesComboboxAction } from "@/actions/workplace/get-list";
import WorkplaceForm from "../workplaces/workplace-form";
import { unassignPostFromWorkplace } from "@/actions/workplace/unassign-post";
import { useRouter } from "next/navigation";

interface PostFormProps {
  initialData?: Post;
}

const PostForm = ({ initialData }: PostFormProps) => {
  const router = useRouter();

  const headerImageRef = useRef<FormImageUploadHandle>(null);
  const thumbnailImageRef = useRef<FormImageUploadHandle>(null);
  const thumbnailGifRef = useRef<FormImageUploadHandle>(null);

  const [categories, setCategories] = useState<string[]>(
    initialData?.categoryIds ?? []
  );
  const [workplaces, setWorkplaces] = useState<string[]>(
    initialData?.workplaceId ? [initialData?.workplaceId] : []
  );

  const { saveAsDraft, sections, setSaveAsDraft } = usePostForm(
    (state) => state
  );

  const {
    execute: executeCreate,
    fieldErrors: createFieldErrors,
    isLoading: createIsLoading,
  } = useAction(createPost, {
    onProceed: () => {
      toast.loading("Creating post...", { id: "loading-create-post" });
    },
    onSuccess: async () => {
      toast.success("Post created!");
      await headerImageRef.current?.deleteUnusedImage();
      await thumbnailImageRef.current?.deleteUnusedImage();
      await thumbnailGifRef.current?.deleteUnusedImage();
      router.push("/dashboard/posts");
    },
    onComplete: () => {
      toast.dismiss("loading-create-post");
    },
  });

  const {
    execute: executeUpdate,
    fieldErrors: updateFieldErrors,
    isLoading: updateIsLoading,
  } = useAction(updatePost, {
    onProceed: () => {
      toast.loading("Updating post...", { id: "loading-update-post" });
    },
    onSuccess: async () => {
      toast.success("Post updated!");
    },
    onComplete: () => {
      toast.dismiss("loading-update-post");
    },
  });

  const formAction = (formData: FormData) => {
    const title = formData.get("title") as string;
    const excerpt = formData.get("excerpt") as string;

    const headerImage = headerImageRef.current?.image;
    const thumbnailImage = thumbnailImageRef.current?.image;
    const thumbnailGif = thumbnailGifRef.current?.image;

    if (!headerImage) {
      toast.error("Header image is required");
      return;
    }

    if (!thumbnailImage) {
      toast.error("Thumbnail image is required");
      return;
    }

    if (sections.length <= 0) {
      toast.error("Add at least one section");
      return;
    }

    const payload: z.infer<typeof CreatePost> = {
      title,
      excerpt,
      status: saveAsDraft ? Status.INACTIVE : Status.ACTIVE,
      header_image: {
        ...headerImage,
        img_type: headerImage.img_type ?? undefined,
      },
      thumbnail_image: {
        ...thumbnailImage,
        img_type: thumbnailImage.img_type ?? undefined,
      },
      thumbnail_gif: thumbnailGif
        ? { ...thumbnailGif, img_type: thumbnailGif.img_type ?? undefined }
        : undefined,
      post_sections: sections,
      categoryIds: categories,
      workplaceId: workplaces[0],
    };

    if (initialData?.id) {
      executeUpdate({
        ...payload,
        id: initialData.id,
      });
      return;
    }

    executeCreate(payload);
  };

  return (
    <>
      <form
        id="post-form"
        action={formAction}
        className="flex-1 space-y-6 @container"
      >
        <FormImageUpload
          ref={headerImageRef}
          label="Header Image"
          initialImage={initialData?.header_image || undefined}
        />
        <FormWrapper>
          <FormImageUpload
            ref={thumbnailImageRef}
            label="Thumbnail Image"
            initialImage={initialData?.thumbnail_image || undefined}
          />
          <FormImageUpload
            ref={thumbnailGifRef}
            label="Thumbnail Gif"
            initialImage={initialData?.thumbnail_image || undefined}
          />
        </FormWrapper>

        <FormWrapper>
          <FormInput
            label="Title"
            id="title"
            defaultValue={initialData?.title}
            required={true}
            errors={initialData?.id ? updateFieldErrors : createFieldErrors}
          />
          <FormTextarea
            label="Short Description"
            id="excerpt"
            defaultValue={initialData?.excerpt}
            required={true}
            errors={initialData?.id ? updateFieldErrors : createFieldErrors}
          />
        </FormWrapper>

        <FormWrapper>
          <div>
            <FormCombobox
              parentId={initialData?.id}
              label="Workplace"
              placeholder="Select Workplace..."
              getData={getWorkplacesComboboxAction}
              initialSelected={workplaces}
              FormCreateComponent={WorkplaceForm}
              sideSheetWidth="sm"
              onUnassign={unassignPostFromWorkplace}
              onUpdateSelected={(selected) => setWorkplaces(selected)}
              disabled={createIsLoading || updateIsLoading}
              selectionType="single"
            />
          </div>
          <div>
            <FormCombobox
              parentId={initialData?.id}
              label="Category"
              placeholder="Select Category..."
              getData={getCategoriesComboboxAction}
              initialSelected={categories}
              FormCreateComponent={CategoryForm}
              sideSheetWidth="sm"
              onUnassign={unassignPostFromCategory}
              onUpdateSelected={(selected) => setCategories(selected)}
              disabled={createIsLoading || updateIsLoading}
              selectedChipMode="chip"
            />
          </div>
        </FormWrapper>
      </form>

      <ListPostSection />

      <div className="flex gap-4">
        <Button
          type="submit"
          form="post-form"
          variant="outline"
          onClick={() => setSaveAsDraft(true)}
          disabled={createIsLoading || updateIsLoading}
        >
          Save as Draft
        </Button>
        <Button
          type="submit"
          form="post-form"
          onClick={() => setSaveAsDraft(false)}
          disabled={createIsLoading || updateIsLoading}
        >
          Publish
        </Button>
      </div>
    </>
  );
};

export default PostForm;
