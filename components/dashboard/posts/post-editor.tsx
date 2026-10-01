"use client";

import { createPost } from "@/actions/post/create";
import { Post } from "@/actions/post/get/types";
import { updatePost } from "@/actions/post/update";
import { useAction } from "@/hooks/use-action";
import { Image as ImageType, Status } from "@prisma/client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { CreatePost } from "@/actions/post/create/schema";
import { Button } from "@/components/shadcn/button";
import BlockEditor from "./block-editor/block-editor";
import { useActiveUploadCount } from "./block-editor/upload-manager";
import { deleteCloudinaryImage } from "./block-editor/upload";
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
import { useRouter } from "next/navigation";
import FormSwitch from "@/components/form/form-switch";
import HeaderActionsPortal from "../header-actions-portal";
import { cn } from "@/lib/utils";
import ShowcaseCard from "@/components/home/showcase-card";
import ThumbnailUploader, { ThumbnailValue } from "./thumbnail-uploader";
import CategoryMultiSelect from "./category-multi-select";
import { useCategories } from "./use-categories";
import CoverUploader from "./cover-uploader";
import WorkplacePicker from "./workplace-picker";
import { WorkplacePickerItem } from "@/actions/workplace/get-with-image";
import {
  DETAIL_COLUMN,
  DETAIL_TITLE,
} from "@/components/portfolio-detail/portfolio-styles";

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

  const descRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const [activeTab, setActiveTab] = useState<EditorTab>("thumbnail");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [categories, setCategories] = useState<string[]>(
    initialData?.categoryIds ?? []
  );
  const [workplace, setWorkplace] = useState<WorkplacePickerItem | null>(
    initialData?.workplace
      ? {
          id: initialData.workplace.id,
          name: initialData.workplace.name,
          image: initialData.workplace.image,
        }
      : null
  );

  // Thumbnail + cover are controlled values so the live previews react to them.
  // Cloudinary assets replaced before a save are collected here and deleted
  // after the save succeeds.
  const [thumbnail, setThumbnail] = useState<ThumbnailValue>({
    image: initialData?.thumbnail_image ?? null,
    gif: initialData?.thumbnail_gif ?? null,
  });
  const [cover, setCover] = useState<ImageType | null>(
    initialData?.header_image ?? null
  );
  const orphanPublicIds = useRef<Set<string>>(new Set());
  const collectOrphans = (ids: string[]) =>
    ids.forEach((id) => orphanPublicIds.current.add(id));

  const {
    options: categoryOptions,
    busy: categoriesBusy,
    create: createCategoryOption,
    remove: removeCategoryGlobal,
  } = useCategories();

  const selectedCategoryObjects = categories
    .map((id) => categoryOptions.find((o) => o.id === id))
    .filter(Boolean)
    .map((o) => ({ id: o!.id, name: o!.name }));

  // Number of Section blocks in the body → drives the "preview section amount"
  // options. Clamped to a minimum of 1.
  const [sectionCount, setSectionCount] = useState<number>(
    initialData?.post_sections?.length ?? 0
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

  // Keep the auto-growing textareas sized to their content (incl. prefilled).
  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [excerpt, activeTab]);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [title, activeTab]);

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
    setThumbnail({ image: null, gif: null });
    setCover(null);
    setWorkplace(null);
    setSectionCount(0);
    setErrors({});
  };

  // Delete Cloudinary assets that were replaced/removed during the session,
  // once a save has committed the new ones.
  const cleanupImages = async () => {
    const ids = [...orphanPublicIds.current];
    orphanPublicIds.current.clear();
    await Promise.all(ids.map((id) => deleteCloudinaryImage(id)));
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
      await cleanupImages();
      resetForm();
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
      await cleanupImages();
      resetForm();
      router.push("/dashboard/posts");
    },
    onComplete: () => {
      toast.dismiss("loading-update-post");
    },
  });

  const isLoading = createIsLoading || updateIsLoading;

  /** Validate required fields in tab order, returning the first problem. */
  const validate = (): FieldError | null => {
    const headerImage = cover;
    const thumbnailImage = thumbnail.image;

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
    if (!workplace)
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

    const headerImage = cover!;
    const thumbnailImage = thumbnail.image!;
    const thumbnailGif = thumbnail.gif;

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
      workplaceId: workplace?.id,
      isRestricted: !!isRestricted,
      password: isRestricted ? password : null,
      previewSectionAmount: isRestricted ? previewSectionAmount ?? 1 : null,
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
          {/* Live homepage card preview */}
          <div className="border-b bg-muted/40">
            <div className="mx-auto max-w-3xl px-6 py-10">
              <div className="mx-auto w-full max-w-[560px]">
                <ShowcaseCard
                  title={title}
                  description={excerpt}
                  categories={selectedCategoryObjects}
                  image_url={thumbnail.image?.img_url}
                  gif_url={thumbnail.gif?.img_url}
                  showPlaceholders
                />
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-4xl p-6">
            <div className="grid gap-8 md:grid-cols-[220px_1fr]">
              <ThumbnailUploader
                value={thumbnail}
                error={errors.thumbnail}
                onOrphan={collectOrphans}
                onChange={(next) => {
                  setThumbnail(next);
                  markDirty();
                }}
              />

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
                    ref={descRef}
                    value={excerpt}
                    rows={2}
                    maxLength={DESCRIPTION_MAX}
                    placeholder="Description here"
                    className="resize-none overflow-hidden"
                    onChange={(e) => {
                      setExcerpt(e.target.value);
                      markDirty();
                    }}
                  />
                </Field>

                <CategoryMultiSelect
                  options={categoryOptions}
                  selectedIds={categories}
                  busy={categoriesBusy}
                  onCreate={createCategoryOption}
                  onDeleteGlobal={removeCategoryGlobal}
                  onChange={(ids) => {
                    setCategories(ids);
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
                    if (bool && !previewSectionAmount)
                      setPreviewSectionAmount(1);
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
                      <select
                        value={previewSectionAmount ?? 1}
                        onChange={(e) => {
                          setPreviewSectionAmount(parseInt(e.target.value));
                          markDirty();
                        }}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        {Array.from({
                          length: Math.max(sectionCount, 1),
                        }).map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabPanel>

        {/* CONTENT TAB — the editable live case-study page */}
        <TabPanel active={activeTab === "content"}>
          <CoverUploader
            value={cover}
            error={errors.header}
            onOrphan={collectOrphans}
            onChange={(next) => {
              setCover(next);
              markDirty();
            }}
          />

          <div className="px-6 pb-24">
            <div className={DETAIL_COLUMN}>
              {/* Workplace logo + categories row (matches the live page) */}
              <WorkplacePicker
                value={workplace}
                categories={selectedCategoryObjects}
                error={errors.workplace}
                onChange={(wp) => {
                  setWorkplace(wp);
                  markDirty();
                }}
              />

              {/* Inline title — shares the Thumbnail-tab title field */}
              <textarea
                ref={titleRef}
                value={title}
                rows={1}
                maxLength={TITLE_MAX}
                placeholder="Enter title here"
                onChange={(e) => {
                  setTitle(e.target.value);
                  markDirty();
                }}
                className={cn(
                  DETAIL_TITLE,
                  "w-full resize-none overflow-hidden border-0 bg-transparent p-0 outline-none placeholder:text-muted-foreground/40 focus-visible:ring-0"
                )}
              />

              {/* Body — existing block editor, public section typography */}
              <BlockEditor
                initialHTML={initialBodyHtml}
                onChange={(html) => {
                  bodyHtmlRef.current = html;
                  setSectionCount(documentHtmlToSections(html).length);
                  markDirty();
                }}
                placeholder="Press '/' for commands"
              />
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
