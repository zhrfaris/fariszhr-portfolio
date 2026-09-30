"use client";

import { createPost } from "@/actions/post/create";
import { Post } from "@/actions/post/get/types";
import { updatePost } from "@/actions/post/update";
import FormInput from "@/components/form/form-input";
import FormWrapper from "@/components/form/form-wrapper";
import { useAction } from "@/hooks/use-action";
import { Status } from "@prisma/client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { CreatePost } from "@/actions/post/create/schema";
import { Button } from "@/components/shadcn/button";
import FormImageUpload, {
  FormImageUploadHandle,
} from "@/components/form/form-image-upload";
import FormTextarea from "@/components/form/form-textarea";
import BlockEditor from "./block-editor/block-editor";
import { Label } from "@/components/shadcn/label";
import {
  sectionsToDocumentHtml,
  documentHtmlToSections,
} from "@/lib/section-content";
import { usePostForm } from "@/hooks/use-post-form";
import FormCombobox from "@/components/form/form-combobox/form-combobox";
import { getCategoriesComboboxAction } from "@/actions/category/get-list";
import CategoryForm from "../categories/category-form";
import { unassignPostFromCategory } from "@/actions/category/unassign-post";
import { getWorkplacesComboboxAction } from "@/actions/workplace/get-list";
import WorkplaceForm from "../workplaces/workplace-form";
import { unassignPostFromWorkplace } from "@/actions/workplace/unassign-post";
import { useRouter } from "next/navigation";
import FormSwitch from "@/components/form/form-switch";

interface PostFormProps {
  initialData?: Post;
  initialPasscode?: string;
}

const PostForm = ({ initialData, initialPasscode }: PostFormProps) => {
  const router = useRouter();

  const headerImageRef = useRef<FormImageUploadHandle>(null);
  const thumbnailImageRef = useRef<FormImageUploadHandle>(null);
  const thumbnailGifRef = useRef<FormImageUploadHandle>(null);

  const [categories, setCategories] = useState<string[]>(
    initialData?.categoryIds ?? [],
  );
  const [workplaces, setWorkplaces] = useState<string[]>(
    initialData?.workplaceId ? [initialData?.workplaceId] : [],
  );
  const {
    saveAsDraft,
    isRestricted,
    isDirty,
    setSlug,
    setTitle,
    setExcerpt,
    setSaveAsDraft,
    setIsRestricted,
    setPassword,
    setPreviewSectionAmount,
    setDirty,
  } = usePostForm((state) => state);

  // The whole post body is one Tiptap document. Seed it from the stored
  // sections once, then track the current HTML in a ref (updated on change).
  const initialBodyHtml = useMemo(
    () => sectionsToDocumentHtml(initialData?.post_sections ?? []),
    [initialData]
  );
  const bodyHtmlRef = useRef<string>(initialBodyHtml);

  useEffect(() => {
    if (initialData) {
      setIsRestricted(initialData?.isRestricted);
      setTitle(initialData?.title);
      setSlug(initialData?.slug);
      setExcerpt(initialData?.excerpt);
    }
  }, [initialData, setExcerpt, setTitle, setSlug, setIsRestricted]);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const resetForm = () => {
    setTitle("");
    setExcerpt("");
    setIsRestricted(null);
    setPassword(null);
    setPreviewSectionAmount(null);
    setDirty(false);
    bodyHtmlRef.current = "";
  };

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
      resetForm();
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
      resetForm();
      await headerImageRef.current?.deleteUnusedImage();
      await thumbnailImageRef.current?.deleteUnusedImage();
      await thumbnailGifRef.current?.deleteUnusedImage();
      router.push("/dashboard/posts");
    },
    onComplete: () => {
      toast.dismiss("loading-update-post");
    },
  });

  const formAction = (formData: FormData) => {
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

    const post_sections = documentHtmlToSections(bodyHtmlRef.current);

    const slug = formData.get("slug") as string;
    const title = formData.get("title") as string;
    const excerpt = formData.get("excerpt") as string;
    const isRestricted = formData.get("isRestricted") as string;
    const password = formData.get("password") as string;
    const previewSectionAmount = formData.get("previewSectionAmount") as string;

    const payload: z.infer<typeof CreatePost> = {
      title,
      excerpt,
      status: saveAsDraft ? Status.INACTIVE : Status.ACTIVE,
      header_image: {
        ...headerImage,
        img_type: headerImage.img_type,
      },
      thumbnail_image: {
        ...thumbnailImage,
        img_type: thumbnailImage.img_type,
      },
      thumbnail_gif: thumbnailGif
        ? { ...thumbnailGif, img_type: thumbnailGif.img_type }
        : null,
      post_sections,
      categoryIds: categories,
      workplaceId: workplaces[0],
      isRestricted: isRestricted === "on",
      password: isRestricted === "on" ? password : null,
      previewSectionAmount:
        isRestricted === "on" ? parseInt(previewSectionAmount || "0") : null,
    };

    if (initialData?.id) {
      executeUpdate({
        ...payload,
        id: initialData.id,
        slug,
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
        onChange={() => setDirty(true)}
        className="flex-1 space-y-6 @container"
      >
        {/* 
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        */}
        {initialData?.id && (
          <FormInput
            label="Post ID"
            id="slug"
            defaultValue={initialData?.slug}
            required={true}
            errors={updateFieldErrors}
          />
        )}
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
            initialImage={initialData?.thumbnail_gif || undefined}
            showDeleteButton={true}
          />
        </FormWrapper>

        <FormWrapper>
          {/*
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        */}
          <FormInput
            label="Title"
            id="title"
            defaultValue={initialData?.title}
            required={true}
            errors={initialData?.id ? updateFieldErrors : createFieldErrors}
          />
          {/* 
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          */}
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
              label="Category"
              sideSheetWidth="sm"
              selectedChipMode="chip"
              parentId={initialData?.id}
              initialSelected={categories}
              placeholder="Select Category..."
              FormCreateComponent={CategoryForm}
              onUnassign={unassignPostFromCategory}
              getData={getCategoriesComboboxAction}
              disabled={createIsLoading || updateIsLoading}
              onUpdateSelected={(selected) => setCategories(selected)}
            />
          </div>
        </FormWrapper>

        <FormWrapper>
          <FormSwitch
            label="Restrict Post?"
            id="isRestricted"
            value={isRestricted === null ? false : isRestricted}
            onCheckedChange={(bool) => setIsRestricted(bool)}
            errors={initialData?.id ? updateFieldErrors : createFieldErrors}
          />
        </FormWrapper>

        {isRestricted && (
          <FormWrapper>
            <FormInput
              label="Password"
              id="password"
              required={!!isRestricted}
              defaultValue={initialPasscode || ""}
              placeholder="Insert password to unlock post"
              errors={initialData?.id ? updateFieldErrors : createFieldErrors}
            />
            {/* 
            value={previewSectionAmount || ""}
              onChange={(e) =>
                setPreviewSectionAmount(parseInt(e.target.value))
              }
            */}
            <FormInput
              label="Preview section amount"
              id="previewSectionAmount"
              required={!!isRestricted}
              defaultValue={String(initialData?.previewSectionAmount || 3)}
              type="number"
              placeholder="Insert the amount of section can be previewed when restricted"
              errors={initialData?.id ? updateFieldErrors : createFieldErrors}
            />
          </FormWrapper>
        )}
      </form>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground/70">
          Post Body
        </Label>
        <div className="rounded-md border border-black/30 p-4">
          <BlockEditor
            initialHTML={initialBodyHtml}
            onChange={(html) => {
              bodyHtmlRef.current = html;
              setDirty(true);
            }}
            placeholder="Type '/' for commands, or '/section' to add a section…"
          />
        </div>
      </div>

      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            if (
              isDirty &&
              !window.confirm("You have unsaved changes. Leave anyway?")
            ) {
              return;
            }
            router.push("/dashboard/posts");
            resetForm();
          }}
          disabled={createIsLoading || updateIsLoading}
        >
          Cancel
        </Button>
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
