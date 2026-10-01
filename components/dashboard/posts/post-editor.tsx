"use client";

import { createPost } from "@/actions/post/create";
import { Post } from "@/actions/post/get/types";
import { updatePost } from "@/actions/post/update";
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
import BlockEditor from "./block-editor/block-editor";
import { useActiveUploadCount } from "./block-editor/upload-manager";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";
import { Label } from "@/components/shadcn/label";
import { Input } from "@/components/shadcn/input";
import { Textarea } from "@/components/shadcn/textarea";
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
import HeaderActionsPortal from "../header-actions-portal";
import { cn } from "@/lib/utils";

export type EditorTab = "thumbnail" | "content";

/** Max lengths for the Title / Description fields (design placeholders — swap
 * for the longest-existing values once the DB is reachable). */
export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 150;

interface PostEditorProps {
  initialData?: Post;
  initialPasscode?: string;
}

type FieldError = { field: string; tab: EditorTab; message: string };

const PostEditor = ({ initialData, initialPasscode }: PostEditorProps) => {
  const router = useRouter();

  const headerImageRef = useRef<FormImageUploadHandle>(null);
  const thumbnailImageRef = useRef<FormImageUploadHandle>(null);
  const thumbnailGifRef = useRef<FormImageUploadHandle>(null);

  const [activeTab, setActiveTab] = useState<EditorTab>("thumbnail");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [categories, setCategories] = useState<string[]>(
    initialData?.categoryIds ?? []
  );
  const [workplaces, setWorkplaces] = useState<string[]>(
    initialData?.workplaceId ? [initialData?.workplaceId] : []
  );

  const {
    title,
    excerpt,
    isRestricted,
    password,
    previewSectionAmount,
    isDirty,
    setTitle,
    setExcerpt,
    setSaveAsDraft,
    setIsRestricted,
    setPassword,
    setPreviewSectionAmount,
    setDirty,
  } = usePostForm((state) => state);

  const uploadsInProgress = useActiveUploadCount() > 0;

  // The whole post body is one Tiptap document. Seed it from the stored
  // sections once, then track the current HTML in a ref (updated on change).
  const initialBodyHtml = useMemo(
    () => sectionsToDocumentHtml(initialData?.post_sections ?? []),
    [initialData]
  );
  const bodyHtmlRef = useRef<string>(initialBodyHtml);

  useEffect(() => {
    if (initialData) {
      setIsRestricted(initialData?.isRestricted ?? null);
      setTitle(initialData?.title ?? "");
      setExcerpt(initialData?.excerpt ?? "");
      setPreviewSectionAmount(initialData?.previewSectionAmount ?? null);
      // Seed the decrypted passcode so saving an untouched restricted post
      // doesn't wipe its password (the field is controlled now).
      setPassword(initialPasscode || null);
    } else {
      // Creating a fresh post — clear any state left over from a prior edit.
      setTitle("");
      setExcerpt("");
      setIsRestricted(null);
      setPassword(null);
      setPreviewSectionAmount(null);
    }
    setDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const markDirty = () => setDirty(true);

  const resetForm = () => {
    setTitle("");
    setExcerpt("");
    setIsRestricted(null);
    setPassword(null);
    setPreviewSectionAmount(null);
    setDirty(false);
    bodyHtmlRef.current = "";
    setErrors({});
  };

  const {
    execute: executeCreate,
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

  const isLoading = createIsLoading || updateIsLoading;

  /** Validate required fields in tab order, returning the first problem. */
  const validate = (): FieldError | null => {
    const headerImage = headerImageRef.current?.image;
    const thumbnailImage = thumbnailImageRef.current?.image;

    const checks: FieldError[] = [];
    if (!title.trim())
      checks.push({ field: "title", tab: "thumbnail", message: "Title is required" });
    if (!excerpt.trim())
      checks.push({
        field: "excerpt",
        tab: "thumbnail",
        message: "Description is required",
      });
    if (!thumbnailImage)
      checks.push({
        field: "thumbnail",
        tab: "thumbnail",
        message: "A thumbnail image is required",
      });
    if (isRestricted && (!password || !password.trim()))
      checks.push({
        field: "password",
        tab: "thumbnail",
        message: "Password is required when the post is restricted",
      });
    if (!headerImage)
      checks.push({
        field: "header",
        tab: "content",
        message: "A cover image is required",
      });
    if (!workplaces[0])
      checks.push({
        field: "workplace",
        tab: "content",
        message: "A workplace is required",
      });

    return checks[0] ?? null;
  };

  const handleSave = (asDraft: boolean) => {
    if (uploadsInProgress) {
      toast.warning("Wait for images to finish uploading");
      return;
    }

    const problem = validate();
    if (problem) {
      setErrors({ [problem.field]: problem.message });
      setActiveTab(problem.tab);
      toast.error(problem.message);
      return;
    }
    setErrors({});
    setSaveAsDraft(asDraft);

    const headerImage = headerImageRef.current!.image!;
    const thumbnailImage = thumbnailImageRef.current!.image!;
    const thumbnailGif = thumbnailGifRef.current?.image;

    const post_sections = documentHtmlToSections(bodyHtmlRef.current);

    const payload: z.infer<typeof CreatePost> = {
      title,
      excerpt,
      status: asDraft ? Status.INACTIVE : Status.ACTIVE,
      header_image: { ...headerImage, img_type: headerImage.img_type },
      thumbnail_image: { ...thumbnailImage, img_type: thumbnailImage.img_type },
      thumbnail_gif: thumbnailGif
        ? { ...thumbnailGif, img_type: thumbnailGif.img_type }
        : null,
      post_sections,
      categoryIds: categories,
      workplaceId: workplaces[0],
      isRestricted: !!isRestricted,
      password: isRestricted ? password : null,
      previewSectionAmount: isRestricted ? previewSectionAmount ?? 0 : null,
    };

    if (initialData?.id) {
      executeUpdate({ ...payload, id: initialData.id });
      return;
    }
    executeCreate(payload);
  };

  const handleCancel = () => {
    if (isDirty && !window.confirm("You have unsaved changes. Leave anyway?")) {
      return;
    }
    resetForm();
    router.push("/dashboard/posts");
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Segmented control lives in the dashboard header, on the right. */}
      <HeaderActionsPortal>
        <SegmentedControl value={activeTab} onChange={setActiveTab} />
      </HeaderActionsPortal>

      <div className="flex-1">
        {/* THUMBNAIL TAB */}
        <TabPanel active={activeTab === "thumbnail"}>
          <div className="mx-auto max-w-5xl space-y-6 p-6">
            <div className="grid gap-6 md:grid-cols-[220px_1fr]">
              <div className="space-y-3">
                <FormImageUpload
                  ref={thumbnailImageRef}
                  label="Thumbnail image"
                  initialImage={initialData?.thumbnail_image || undefined}
                />
                <FormImageUpload
                  ref={thumbnailGifRef}
                  label="Thumbnail GIF (optional)"
                  initialImage={initialData?.thumbnail_gif || undefined}
                  showDeleteButton={true}
                />
                <ErrorText message={errors.thumbnail} />
              </div>

              <div className="space-y-5">
                <Field
                  label="Title"
                  counter={`${title.length}/${TITLE_MAX}`}
                  error={errors.title}
                >
                  <Input
                    value={title}
                    maxLength={TITLE_MAX}
                    placeholder="Title here"
                    onChange={(e) => {
                      setTitle(e.target.value);
                      markDirty();
                    }}
                  />
                </Field>

                <Field
                  label="Description"
                  counter={`${excerpt.length}/${DESCRIPTION_MAX}`}
                  error={errors.excerpt}
                >
                  <Textarea
                    value={excerpt}
                    maxLength={DESCRIPTION_MAX}
                    placeholder="Description here"
                    onChange={(e) => {
                      setExcerpt(e.target.value);
                      markDirty();
                    }}
                  />
                </Field>

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
                  disabled={isLoading}
                  onUpdateSelected={(selected) => {
                    setCategories(selected);
                    markDirty();
                  }}
                />

                <hr className="border-border" />

                <FormSwitch
                  label="Restrict post?"
                  id="isRestricted"
                  value={isRestricted === null ? false : isRestricted}
                  onCheckedChange={(bool) => {
                    setIsRestricted(bool);
                    markDirty();
                  }}
                />

                {isRestricted && (
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Password" error={errors.password}>
                      <Input
                        value={password ?? ""}
                        placeholder="Password to unlock the post"
                        onChange={(e) => {
                          setPassword(e.target.value);
                          markDirty();
                        }}
                      />
                    </Field>
                    <Field label="Preview section amount">
                      <Input
                        type="number"
                        min={1}
                        value={previewSectionAmount ?? ""}
                        placeholder="Sections visible when restricted"
                        onChange={(e) => {
                          setPreviewSectionAmount(
                            e.target.value ? parseInt(e.target.value) : null
                          );
                          markDirty();
                        }}
                      />
                    </Field>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabPanel>

        {/* CONTENT TAB */}
        <TabPanel active={activeTab === "content"}>
          <div className="mx-auto max-w-3xl space-y-6 p-6">
            <div className="space-y-2">
              <FormImageUpload
                ref={headerImageRef}
                label="Cover image"
                initialImage={initialData?.header_image || undefined}
              />
              <ErrorText message={errors.header} />
            </div>

            <FormCombobox
              parentId={initialData?.id}
              label="Workplace"
              placeholder="Select Workplace..."
              getData={getWorkplacesComboboxAction}
              initialSelected={workplaces}
              FormCreateComponent={WorkplaceForm}
              sideSheetWidth="sm"
              onUnassign={unassignPostFromWorkplace}
              onUpdateSelected={(selected) => {
                setWorkplaces(selected);
                markDirty();
              }}
              disabled={isLoading}
              selectionType="single"
            />
            <ErrorText message={errors.workplace} />

            <Field label="Title" counter={`${title.length}/${TITLE_MAX}`}>
              <Input
                value={title}
                maxLength={TITLE_MAX}
                placeholder="Enter title here"
                onChange={(e) => {
                  setTitle(e.target.value);
                  markDirty();
                }}
              />
            </Field>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground/70">
                Body
              </Label>
              <div className="rounded-md border border-black/30 p-4">
                <BlockEditor
                  initialHTML={initialBodyHtml}
                  onChange={(html) => {
                    bodyHtmlRef.current = html;
                    markDirty();
                  }}
                  placeholder="Press '/' for commands"
                />
              </div>
            </div>
          </div>
        </TabPanel>
      </div>

      {/* Sticky bottom action bar */}
      <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t bg-background px-6 py-3">
        <Button
          type="button"
          variant="ghost"
          onClick={handleCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={uploadsInProgress ? 0 : undefined}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSave(true)}
                  disabled={isLoading || uploadsInProgress}
                >
                  Save as Draft
                </Button>
              </span>
            </TooltipTrigger>
            {uploadsInProgress && (
              <TooltipContent>
                Wait for images to finish uploading
              </TooltipContent>
            )}
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={uploadsInProgress ? 0 : undefined}>
                <Button
                  type="button"
                  onClick={() => handleSave(false)}
                  disabled={isLoading || uploadsInProgress}
                >
                  Publish
                </Button>
              </span>
            </TooltipTrigger>
            {uploadsInProgress && (
              <TooltipContent>
                Wait for images to finish uploading
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- helpers */

function SegmentedControl({
  value,
  onChange,
}: {
  value: EditorTab;
  onChange: (tab: EditorTab) => void;
}) {
  return (
    <div className="flex items-center rounded-lg border bg-muted p-1 text-sm">
      {(["thumbnail", "content"] as const).map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={cn(
            "rounded-md px-4 py-1.5 font-medium capitalize transition-colors",
            value === tab
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

/** Keep both tab panels mounted (just hidden) so switching tabs never loses
 * in-progress edits, upload refs, or the block editor's state. */
function TabPanel({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return <div className={cn(active ? "block" : "hidden")}>{children}</div>;
}

function Field({
  label,
  counter,
  error,
  children,
}: {
  label: string;
  counter?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-foreground/80">
          {label}
        </Label>
        {counter && (
          <span className="text-xs text-muted-foreground">{counter}</span>
        )}
      </div>
      {children}
      <ErrorText message={error} />
    </div>
  );
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export default PostEditor;
