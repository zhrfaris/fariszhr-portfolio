"use client";

import { createPost } from "@/actions/post/create";
import { Post } from "@/actions/post/get/types";
import { updatePost } from "@/actions/post/update";
import FormInput from "@/components/form/form-input";
import FormWrapper from "@/components/form/form-wrapper";
import { useAction } from "@/hooks/use-action";
import { Status } from "@prisma/client";
import React, { useState } from "react";
import { toast } from "sonner";
import { Image as ImageType } from "@prisma/client";
import { z } from "zod";
import { CreatePost } from "@/actions/post/create/schema";
import { Button } from "@/components/shadcn/button";

interface PostFormProps {
  initialData?: Post;
}

const PostForm = ({ initialData }: PostFormProps) => {
  // const [headerImage, setHeaderImage] = useState<ImageType | undefined>(
  const [headerImage] = useState<ImageType | undefined>(
    initialData?.header_image
  );
  // const [thumbnailImage, setThumbnailImage] = useState<ImageType | undefined>(
  const [thumbnailImage] = useState<ImageType | undefined>(
    initialData?.thumbnail_image
  );
  // const [thumbnailGif, setThumbnailGif] = useState<ImageType | undefined>(
  const [thumbnailGif] = useState<ImageType | undefined>(
    initialData?.thumbnail_gif ?? undefined
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
    const status = formData.get("status") as Status;

    if (!headerImage) {
      toast.error("Header image is required");
      return;
    }

    if (!thumbnailImage) {
      toast.error("Thumbnail image is required");
      return;
    }

    const payload: z.infer<typeof CreatePost> = {
      title,
      excerpt,
      status,
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
      post_sections: [],
      categoryIds: [],
      workplaceId: "",
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
    <form action={formAction} className="flex-1 space-y-6">
      <FormWrapper>
        <FormInput
          label="Title"
          id="title"
          defaultValue={initialData?.title}
          required={true}
          errors={initialData?.id ? updateFieldErrors : createFieldErrors}
        />
      </FormWrapper>
      <Button type="submit" disabled={createIsLoading || updateIsLoading}>
        Save
      </Button>
    </form>
  );
};

export default PostForm;
