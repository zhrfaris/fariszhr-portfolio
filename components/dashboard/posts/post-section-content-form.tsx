"use client";

import {
  contentImageEnum,
  contentImageRadiusEnum,
  ContentImageRadiusNum,
  contentImageRadiusNum,
  ContentImageRadiusType,
  contentRadiusNum,
} from "@/actions/post/create/schema";
import { PostSectionContent } from "@/actions/post/create/types";
import FormImageUpload, {
  FormImageUploadHandle,
} from "@/components/form/form-image-upload";
import FormTextEditor from "@/components/form/form-rich-text-editor";
import FormSelect from "@/components/form/form-select";
import { BasicFormProps } from "@/components/form/popover-form";
import { Button } from "@/components/shadcn/button";
import { usePostForm } from "@/hooks/use-post-form";
import { getKeyByValue } from "@/lib/utils";
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

  const { contents, editContentData, setEditContentData } = usePostForm(
    (state) => state
  );

  const formAction = async (formData: FormData) => {
    const content = formData.get("content") as string;
    const radius = formData.get("radius") as ContentImageRadiusNum;

    const content_image_radius: ContentImageRadiusType =
      contentRadiusNum[radius];
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
      content_image_type: contentImageEnum.Values.DEFAULT,
      content_image_radius,
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
        id="radius"
        label="Image Radius"
        values={contentImageRadiusNum}
        defaultValue={
          getKeyByValue(
            contentRadiusNum,
            initialData?.content_image_radius ??
              contentImageRadiusEnum.Values.XXL
          ) ?? "16px"
        }
      />
      {editContentData && (
        <div className="flex items-center gap-4 pb-6 border-b border-[#d9d9d9]">
          <Button form="post-content-form" type="submit">
            Save changes
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setEditContentData(null)}
          >
            Cancel Edit Content
          </Button>
        </div>
      )}
    </form>
  );
};

export default PostSectionContentForm;
