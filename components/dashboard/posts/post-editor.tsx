"use client";

import { createPost } from "@/actions/post/create";
import { Post } from "@/actions/post/get/types";
import { updatePost } from "@/actions/post/update";
import { useAction } from "@/hooks/use-action";
import { Image as ImageType, Status } from "@prisma/client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  SectionCard,
} from "@/components/dashboard/section-card";
import {
  PageColumn,
  PageShell,
  StickyActionBar,
} from "@/components/dashboard/page-layout";
import { WorkplacePickerItem } from "@/actions/workplace/get-with-image";
import {
  PostPreviewData,
  clearPreview,
  writePreview,
} from "@/lib/post-preview";

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
  const postId = initialData?.id;

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
    mobile: initialData?.thumbnail_mobile ?? null,
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

  const {
    title,
    excerpt,
    isRestricted,
    password,
    isDirty,
    setTitle,
    setExcerpt,
    setSaveAsDraft,
    setIsRestricted,
    setPassword,
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
      // Seed the decrypted passcode so saving an untouched restricted post
      // doesn't wipe its password (the field is controlled now).
      setPassword(initialPasscode || null);
    } else {
      // Creating a fresh post — clear any state left over from a prior edit.
      setTitle("");
      setExcerpt("");
      setIsRestricted(null);
      setPassword(null);
    }
    setDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

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
    setDirty(false);
    bodyHtmlRef.current = "";
    setThumbnail({ image: null, gif: null, mobile: null });
    setCover(null);
    setWorkplace(null);
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
      if (postId) clearPreview(postId);
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
    const thumbnailMobile = thumbnail.mobile;

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
      thumbnail_mobile: thumbnailMobile
        ? { ...thumbnailMobile, img_type: thumbnailMobile.img_type }
        : null,
      post_sections,
      categoryIds: categories,
      workplaceId: workplace?.id,
      isRestricted: !!isRestricted,
      password: isRestricted ? password : null,
    };

    if (initialData?.id) {
      executeUpdate({ ...payload, id: initialData.id });
      return;
    }
    executeCreate(payload);
  };

  /* ------------------------------------------------------------ preview */
  // Preview hands the current (unsaved) state to a new tab via localStorage;
  // nothing is saved and the post's status is untouched. Once a preview has
  // been opened, further edits are re-sent (debounced) so the tab stays live.
  const previewActiveRef = useRef(false);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildPreview = (): PostPreviewData => ({
    title,
    excerpt,
    header_image: cover,
    categories: categories
      .map(
        (id) =>
          categoryOptions.find((o) => o.id === id) ??
          initialData?.categories.find((c) => c.id === id)
      )
      .filter((c): c is { id: string; name: string } => !!c)
      .map((c) => ({ id: c.id, name: c.name })),
    workplace: workplace
      ? { id: workplace.id, name: workplace.name, image: workplace.image }
      : null,
    post_sections: documentHtmlToSections(bodyHtmlRef.current),
    updatedAt: Date.now(),
  });
  // Read through a ref so the debounced write always sends the latest state.
  const buildPreviewRef = useRef(buildPreview);
  buildPreviewRef.current = buildPreview;

  const schedulePreviewSync = useCallback(() => {
    if (!postId || !previewActiveRef.current) return;
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    previewTimerRef.current = setTimeout(() => {
      writePreview(postId, buildPreviewRef.current());
    }, 500);
  }, [postId]);

  useEffect(() => {
    schedulePreviewSync();
  }, [title, excerpt, cover, categories, workplace, schedulePreviewSync]);

  // The editor starts from the saved post, so any preview data left over
  // from an earlier session is stale.
  useEffect(() => {
    if (postId) clearPreview(postId);
    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, [postId]);

  const handlePreview = () => {
    if (!postId || !initialData?.slug) return;
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    previewActiveRef.current = true;
    writePreview(postId, buildPreview());
    // Named target: clicking again focuses the same preview tab.
    window.open(
      `/dashboard/posts/${initialData.slug}/preview`,
      `post-preview-${postId}`
    );
  };

  const handleCancel = () => {
    if (isDirty && !window.confirm("You have unsaved changes. Leave anyway?")) {
      return;
    }
    if (postId) clearPreview(postId);
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
          description="Keep it public, or lock it with a password. Visitors only see the cover, categories and title until they enter it."
          action={
            <Switch
              id="isRestricted"
              name="isRestricted"
              aria-label="Restrict post"
              checked={isRestricted === null ? false : isRestricted}
              onCheckedChange={(bool) => {
                setIsRestricted(bool);
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
              markDirty();
              schedulePreviewSync();
            }}
            placeholder="Press '/' for commands"
          />
        </SectionCard>
      </PageColumn>

      <StickyActionBar>
        {/* Preview only exists for saved posts (it lives at the post's URL).
            mr-auto pins it to the far left of the right-aligned bar. */}
        {postId && (
          <Button
            type="button"
            variant="ghost"
            className="mr-auto"
            onClick={handlePreview}
          >
            <Eye />
            Preview
          </Button>
        )}
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
