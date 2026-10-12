"use client";

import React, { Fragment, useEffect, useState } from "react";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import {
  AlertCircle,
  ChevronDown,
  Loader2,
  RotateCw,
  Trash2,
  X,
} from "lucide-react";

import { ContentImageRadiusType } from "@/actions/post/create/schema";
import { getRadiusPx, RADIUS_PX } from "@/lib/section-content";
import { cn } from "@/lib/utils";
import { Button } from "@/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";
import { deleteCloudinaryImage } from "./upload";
import {
  removeUploadTask,
  retryUploadTask,
  useUploadTask,
} from "./upload-manager";

/** Selectable corner radii (in enum order 8 -> 24px). SM (4px) and MD (6px)
 * remain valid for existing images but are no longer offered here. */
const SELECTABLE_RADII: ContentImageRadiusType[] = ["LG", "XL", "XXL", "XXXL"];

interface ToolbarAction {
  key: string;
  dividerBefore?: boolean;
  render: () => React.ReactNode;
}

const CircularProgress = ({ value }: { value: number }) => {
  const radius = 13;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" className="shrink-0">
      <circle
        cx="17"
        cy="17"
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="3"
      />
      <circle
        cx="17"
        cy="17"
        r={radius}
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 17 17)"
        style={{ transition: "stroke-dashoffset 0.15s ease" }}
      />
    </svg>
  );
};

const RadiusControl = ({
  radius,
  open,
  onOpenChange,
  onSelect,
}: {
  radius: ContentImageRadiusType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (r: ContentImageRadiusType) => void;
}) => (
  <div className="flex items-center gap-3">
    <span className="text-sm font-medium text-foreground">Corner radius</span>
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-foreground focus:outline-none focus-visible:ring-focus focus-visible:ring-ring"
        >
          <span>{getRadiusPx(radius)}px</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="min-w-[7rem] rounded-xl p-1 shadow-lg"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {SELECTABLE_RADII.map((r) => (
          <DropdownMenuItem
            key={r}
            onSelect={() => onSelect(r)}
            className={cn(
              "cursor-pointer rounded-md px-3 py-2 text-sm",
              radius === r && "bg-muted focus:bg-muted"
            )}
          >
            {RADIUS_PX[r]}px
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

const ImageNodeView = ({
  node,
  updateAttributes,
  deleteNode,
  selected,
}: NodeViewProps) => {
  const { src, radius, publicId, uploadId } = node.attrs as {
    src: string;
    radius: ContentImageRadiusType;
    publicId: string;
    uploadId: string | null;
  };

  const task = useUploadTask(uploadId ?? null);
  const [openKey, setOpenKey] = useState<string | null>(null);

  // When the upload finishes, swap the local preview for the real Cloudinary
  // attributes and detach the transient upload task.
  useEffect(() => {
    if (!uploadId || task?.status !== "done" || !task.result) return;
    const r = task.result;
    updateAttributes({
      src: r.src,
      publicId: r.publicId,
      placeholder: r.placeholder,
      thumbnail: r.thumbnail,
      width: r.width,
      height: r.height,
      imgType: r.imgType,
      uploadId: null,
    });
    removeUploadTask(uploadId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadId, task?.status]);

  const isUploading =
    !!uploadId && (task?.status === "uploading" || task?.status === "processing");
  const isError = !!uploadId && task?.status === "error";

  const handleDelete = () => {
    if (uploadId) removeUploadTask(uploadId);
    if (publicId) void deleteCloudinaryImage(publicId);
    deleteNode();
  };

  const actions: ToolbarAction[] = [
    {
      key: "radius",
      render: () => (
        <RadiusControl
          radius={radius}
          open={openKey === "radius"}
          onOpenChange={(o) => setOpenKey(o ? "radius" : null)}
          onSelect={(r) => {
            updateAttributes({ radius: r });
            setOpenKey(null);
          }}
        />
      ),
    },
    {
      key: "delete",
      dividerBefore: true,
      render: () => (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive hover:text-destructive"
              aria-label="Delete"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
      ),
    },
  ];

  const showToolbar = (selected || openKey !== null) && !isUploading && !isError;

  return (
    <NodeViewWrapper className="relative my-4" data-drag-handle draggable="true">
      <div
        className={cn(
          "w-full min-h-12 border overflow-hidden relative transition-shadow",
          selected ? "border-primary ring-focus ring-ring" : "border-input"
        )}
        style={{ borderRadius: getRadiusPx(radius) }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className={cn(
            "w-full object-contain transition-opacity",
            (isUploading || isError) && "opacity-60"
          )}
        />

        {/* Upload progress / processing indicator (bottom-right) */}
        {isUploading && (
          <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white">
            {task?.status === "processing" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing…</span>
              </>
            ) : (
              <>
                <CircularProgress value={task?.progress ?? 0} />
                <span>{task?.progress ?? 0}%</span>
              </>
            )}
          </div>
        )}

        {/* Error overlay */}
        {isError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 p-4 text-center text-white">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <p className="max-w-md text-sm">
              {task?.error ?? "Upload failed"}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (uploadId) retryUploadTask(uploadId);
                }}
              >
                <RotateCw className="mr-1 h-4 w-4" />
                Retry
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleDelete();
                }}
              >
                <X className="mr-1 h-4 w-4" />
                Remove
              </Button>
            </div>
          </div>
        )}
      </div>

      {showToolbar && (
        <TooltipProvider delayDuration={200}>
          <div
            className="absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 shadow-lg"
            // Keep the ProseMirror node selected while using the toolbar.
            onMouseDown={(e) => e.preventDefault()}
          >
            {actions.map((action) => (
              <Fragment key={action.key}>
                {action.dividerBefore && (
                  <span className="mx-0.5 h-5 w-px bg-border" />
                )}
                {action.render()}
              </Fragment>
            ))}
          </div>
        </TooltipProvider>
      )}
    </NodeViewWrapper>
  );
};

export default ImageNodeView;
