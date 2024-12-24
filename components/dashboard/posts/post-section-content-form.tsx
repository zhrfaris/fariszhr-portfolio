"use client";

import { PostSectionContent } from "@/actions/post/create/types";
import FormImageUpload, {
  FormImageUploadHandle,
} from "@/components/form/form-image-upload";
import FormInput from "@/components/form/form-input";
import FormTextEditor from "@/components/form/form-rich-text-editor";
import { BasicFormProps } from "@/components/form/popover-form";
import { usePostForm } from "@/hooks/use-post-form";
import React, { useRef } from "react";

interface PostSectionContentFormProps {
  changeContent: (Content: PostSectionContent) => void;
}

const PostSectionContentForm = ({
  changeContent,
  initialData,
}: BasicFormProps<PostSectionContent, PostSectionContentFormProps>) => {
  const contentImageRef = useRef<FormImageUploadHandle>(null);

  const { contents } = usePostForm((state) => state);

  const formAction = (formData: FormData) => {
    const content = formData.get("content") as string;
    // const content_image_type = formData.get("content_image_type") as string;

    const image = contentImageRef?.current?.image;

    const payload: PostSectionContent = {
      id: initialData?.id || crypto.randomUUID(),
      order: initialData?.order || contents.length || 0,
      content,
      image,
      content_image_type: "DEFAULT",
    };

    changeContent(payload);
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

      {contentImageRef?.current?.image && (
        <FormInput
          label="Image type"
          id="content_image_type"
          defaultValue={initialData?.content_image_type}
        />
      )}
    </form>
  );
};

export default PostSectionContentForm;
