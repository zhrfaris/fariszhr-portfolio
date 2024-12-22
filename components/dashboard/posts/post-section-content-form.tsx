"use client";

import { PostSectionContent } from "@/actions/post/create/types";
import FormImageUpload, {
  FormImageUploadHandle,
} from "@/components/form/form-image-upload";
import FormInput from "@/components/form/form-input";
import FormTextEditor from "@/components/form/form-rich-text-editor";
import { BasicFormProps } from "@/components/form/popover-form";
import { Button } from "@/components/shadcn/button";
import React, { useRef } from "react";

interface PostSectionContentFormProps {
  addContent: (Content: PostSectionContent) => void;
}

const PostSectionContentForm = ({
  addContent,
  initialData,
}: BasicFormProps<PostSectionContent, PostSectionContentFormProps>) => {
  const contentImageRef = useRef<FormImageUploadHandle>(null);

  const formAction = (formData: FormData) => {
    const content = formData.get("content") as string;
    // const content_image_type = formData.get("content_image_type") as string;

    const image = contentImageRef?.current?.image;

    addContent({
      content,
      image,
      content_image_type: "DEFAULT",
    });
  };

  return (
    <form action={formAction} className="space-y-6">
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

      <div className="flex gap-4">
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};

export default PostSectionContentForm;
