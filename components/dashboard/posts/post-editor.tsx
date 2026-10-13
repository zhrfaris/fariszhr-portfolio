"use client";

import { createPost } from "@/actions/post/create";
import { Post } from "@/actions/post/get/types";
import { updatePost } from "@/actions/post/update";
import { useAction } from "@/hooks/use-action";
import { Image as ImageType, Status } from "@prisma/client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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
import { Switch } from "@/components/shadcn/switch";
import { cn } from "@/lib/utils";
import ThumbnailUploader, { ThumbnailValue } from "./thumbnail-uploader";
import CategoryMultiSelect from "./category-multi-select";
import { useCategories } from "./use-categories";
import CoverUploader from "./cover-uploader";
import WorkplacePicker from "./workplace-picker";
import {
  CardDivider,
  ControlRow,
  SectionCard,
} from "@/components/dashboard/section-card";
import {
  PageColumn,
  PageShell,
  StickyActionBar,
} from "@/components/dashboard/page-layout";
import { WorkplacePickerItem } from "@/actions/workplace/get-with-image";

/** Max lengths for the Title / Description fields. Final values, with enough
 * headroom for every existing post. */
export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 150;

interface PostEditorProps {
  initialData?: Post;
  initialPasscode?: string;
}

/** Validated fields, in the order they appear on the page. */
type FieldKey =
  | "thumbnail"
  | "header"
  | "title"
  | "excerpt"
  | "workplace"
  | "password";
type FieldError = { field: FieldKey; message: string };

const PostEditor = ({ initialData, initialPasscode }: PostEditorProps) => {
  const router = useRouter();

  const descRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const workplaceRef = useRef<HTMLButtonElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const fieldRefs: Record<FieldKey, React.RefObject<HTMLElement | null>> = {
    thumbnail: thumbnailRef,
    header: coverRef,
    title: titleRef,
    excerpt: descRef,
    workplace: workplaceRef,
    password: passwordRef,
  };

  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const clearError = (field: FieldKey) =>
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const [showPassword, setShowPassword] = useState(false);
  // Raw text of the preview-amount input while typing; null shows the stored
  // value (so a cleared field doesn't fight the controlled number).
  const [previewInput, setPreviewInput] = useState<string | null>(null);

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

  // Thumbnail + cover are controlled values. Cloudinary assets replaced
  // before a save are collected here and deleted after the save succeeds.
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
  } = useCategories();

  // Number of Section blocks in the body → the max for "preview section
  // amount" (never below 1).
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

  const maxPreviewSections = Math.max(sectionCount, 1);

  // Keep the auto-growing description sized to its content (incl. prefilled).
  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + el.offsetHeight - el.clientHeight}px`;
  }, [excerpt]);

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

  /** Validate required fields in page order (first entry = topmost). */
  const validate = (): FieldError[] => {
    const checks: FieldError[] = [];
    if (!thumbnail.image)
      checks.push({
        field: "thumbnail",
        message: "A thumbnail image is required",
      });
    if (!cover)
      checks.push({ field: "header", message: "A cover image is required" });
    if (!title.trim())
      checks.push({ field: "title", message: "Title is required" });
    if (!excerpt.trim())
      checks.push({ field: "excerpt", message: "Description is required" });
    if (!workplace)
      checks.push({ field: "workplace", message: "A company is required" });
    if (isRestricted && (!password || !password.trim()))
      checks.push({
        field: "password",
        message: "Password is required when the post is restricted",
      });
    return checks;
  };

  const focusField = (field: FieldKey) => {
    const el = fieldRefs[field].current;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.focus({ preventScroll: true });
  };

  const handleSave = (asDraft: boolean) => {
    if (uploadsInProgress) {
      toast.warning("Wait for images to finish uploading");
      return;
    }

    const problems = validate();
    if (problems.length) {
      setErrors(
        Object.fromEntries(problems.map((p) => [p.field, p.message]))
      );
      focusField(problems[0].field);
      toast.error(problems[0].message);
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
    // Shared dashboard layout: section cards in the 760px column, sticky
    // action bar along the bottom.
    <PageShell>
      <PageColumn>
        <SectionCard
          icon="coverThumbnails"
          title="Cover & Thumbnails"
          description="Images that represent this case study on your portfolio and in shared links."
        >
          <ThumbnailUploader
            ref={thumbnailRef}
            value={thumbnail}
            error={errors.thumbnail}
            onOrphan={collectOrphans}
            onChange={(next) => {
              setThumbnail(next);
              if (next.image) clearError("thumbnail");
              markDirty();
            }}
          />

          <CardDivider />

          <CoverUploader
            ref={coverRef}
            value={cover}
            error={errors.header}
            onOrphan={collectOrphans}
            onChange={(next) => {
              setCover(next);
              if (next) clearError("header");
              markDirty();
            }}
          />
        </SectionCard>

        <SectionCard
          icon="overview"
          title="Overview"
          description="The title, summary, category, and company visitors see before opening the case study."
        >
          <Field
            id="post-title"
            label="Title"
            counter={`${title.length}/${TITLE_MAX}`}
            error={errors.title}
          >
            <Input
              id="post-title"
              ref={titleRef}
              value={title}
              maxLength={TITLE_MAX}
              placeholder="Title here"
              aria-invalid={!!errors.title}
              className={cn(errors.title && "border-destructive")}
              onChange={(e) => {
                setTitle(e.target.value);
                clearError("title");
                markDirty();
              }}
            />
          </Field>

          <Field
            id="post-excerpt"
            label="Description"
            counter={`${excerpt.length}/${DESCRIPTION_MAX}`}
            error={errors.excerpt}
          >
            <Textarea
              id="post-excerpt"
              ref={descRef}
              value={excerpt}
              rows={1}
              maxLength={DESCRIPTION_MAX}
              placeholder="Description here"
              aria-invalid={!!errors.excerpt}
              className={cn(
                "min-h-9 resize-none overflow-hidden",
                errors.excerpt && "border-destructive"
              )}
              onChange={(e) => {
                setExcerpt(e.target.value);
                clearError("excerpt");
                markDirty();
              }}
            />
          </Field>

          <div className="space-y-5">
            <CategoryMultiSelect
              options={categoryOptions}
              selectedIds={categories}
              busy={categoriesBusy}
              onCreate={createCategoryOption}
              onChange={(ids) => {
                setCategories(ids);
                markDirty();
              }}
            />

            <WorkplacePicker
              ref={workplaceRef}
              value={workplace}
              error={errors.workplace}
              onChange={(wp) => {
                setWorkplace(wp);
                if (wp) clearError("workplace");
                markDirty();
              }}
            />
          </div>
        </SectionCard>

        {/* The toggle sits in the header; the fields (and the divider) only
            show while the post is restricted. */}
        <SectionCard
          icon="restrictPost"
          title="Restrict post"
          description="Keep it public, or lock it with a password and choose how many sections visitors can preview first."
          action={
            <Switch
              id="isRestricted"
              name="isRestricted"
              aria-label="Restrict post"
              checked={isRestricted === null ? false : isRestricted}
              onCheckedChange={(bool) => {
                setIsRestricted(bool);
                if (bool && !previewSectionAmount) setPreviewSectionAmount(1);
                if (!bool) clearError("password");
                markDirty();
              }}
            />
          }
        >
          {isRestricted && (
            <>
              <Field
                id="post-password"
                label="Password"
                error={errors.password}
              >
                <div className="relative">
                  <Input
                    id="post-password"
                    ref={passwordRef}
                    type={showPassword ? "text" : "password"}
                    // Keep the browser from autofilling the admin's own login.
                    autoComplete="new-password"
                    value={password ?? ""}
                    placeholder="Password to unlock the post"
                    aria-invalid={!!errors.password}
                    className={cn(
                      "pr-10",
                      errors.password && "border-destructive"
                    )}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearError("password");
                      markDirty();
                    }}
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </Field>

              <ControlRow
                id="post-preview-amount"
                label="Preview section amount"
              >
                <Input
                  id="post-preview-amount"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={maxPreviewSections}
                  step={1}
                  value={previewInput ?? previewSectionAmount ?? 1}
                  onChange={(e) => {
                    setPreviewInput(e.target.value);
                    const n = parseInt(e.target.value, 10);
                    if (Number.isNaN(n)) return;
                    setPreviewSectionAmount(
                      Math.min(Math.max(n, 1), maxPreviewSections)
                    );
                    markDirty();
                  }}
                  onBlur={() => setPreviewInput(null)}
                  className="w-16 shrink-0 text-right"
                />
              </ControlRow>
            </>
          )}
        </SectionCard>

        {/* Body — the block editor itself is unchanged, only framed */}
        <SectionCard
          icon="content"
          title="Content"
          description="Write the full story. Add headings and images, and drag blocks to reorder them."
          className="min-h-48"
        >
          <BlockEditor
            initialHTML={initialBodyHtml}
            onChange={(html) => {
              bodyHtmlRef.current = html;
              const count = documentHtmlToSections(html).length;
              setSectionCount(count);
              // Removing Sections lowers the max preview amount with them.
              const max = Math.max(count, 1);
              if (previewSectionAmount && previewSectionAmount > max)
                setPreviewSectionAmount(max);
              markDirty();
            }}
            placeholder="Press '/' for commands"
          />
        </SectionCard>
      </PageColumn>

      <StickyActionBar>
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
                  variant="secondary"
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
      </StickyActionBar>
    </PageShell>
  );
};

/* ---------------------------------------------------------------- helpers */

function Field({
  id,
  label,
  counter,
  error,
  children,
}: {
  id: string;
  label: string;
  counter?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {counter && (
          <span className="text-[13px] leading-none text-tertiary-foreground">
            {counter}
          </span>
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
