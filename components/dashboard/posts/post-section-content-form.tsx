"use client";

import {
  contentImageEnum,
  contentImages,
  ContentImageType,
} from "@/actions/post/create/schema";
import { PostSectionContent } from "@/actions/post/create/types";
import FormImageUpload, {
  FormImageUploadHandle,
} from "@/components/form/form-image-upload";
import FormTextEditor from "@/components/form/form-rich-text-editor";
import FormSelect from "@/components/form/form-select";
import { BasicFormProps } from "@/components/form/popover-form";
import { usePostForm } from "@/hooks/use-post-form";
import React, { useRef } from "react";
import { toast } from "sonner";

interface PostSectionContentFormProps {
  changeContent: (Content: PostSectionContent) => void;
}

const PostSectionContentForm = ({
  changeContent,
  initialData,
}: BasicFormProps<PostSectionContent, PostSectionContentFormProps>) => {
  const contentImageRef = useRef<FormImageUploadHandle>(null);

  const { contents } = usePostForm((state) => state);

  const formAction = async (formData: FormData) => {
    const content = formData.get("content") as string;
    const content_image_type = formData.get(
      "content_image_type"
    ) as ContentImageType;

    const image = contentImageRef?.current?.image;

    if (!content) {
      toast.error("Section content is required");
      return;
    }

    const payload: PostSectionContent = {
      id: initialData?.id || crypto.randomUUID(),
      order: initialData?.order ?? contents.length,
      content,
      image,
      content_image_type,
    };

    changeContent(payload);
    await contentImageRef?.current?.deleteUnusedImage();
  };

  return (
    <form id="post-content-form" action={formAction} className="space-y-6">
      <FormTextEditor
        id="content"
        label="Section content"
        height={600}
        defaultValue={initialData?.content}
        required={true}
        toolbar={true}
        menubar={true}
      />

      <FormImageUpload
        ref={contentImageRef}
        label="content image"
        initialImage={
          initialData?.image
            ? {
                ...initialData?.image,
                img_type: initialData?.image.img_type ?? null,
              }
            : undefined
        }
      />

      <FormSelect
        id="content_image_type"
        label="Image type"
        values={contentImages}
        defaultValue={
          initialData?.content_image_type ?? contentImageEnum.Values.DEFAULT
        }
      />
    </form>
  );
};

export default PostSectionContentForm;
