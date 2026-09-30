"use client";

import React, { Fragment, useEffect, useState } from "react";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import {
  AlertCircle,
  Check,
  Loader2,
  RotateCw,
  Squircle,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";

import {
  contentImageRadius,
  ContentImageRadiusType,
} from "@/actions/post/create/schema";
import { getRadiusPx, RADIUS_PX } from "@/lib/section-content";
import { cn } from "@/lib/utils";
import { Button } from "@/components/shadcn/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover";
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

interface ToolbarAction {
  key: string;
  tooltip: string;
  icon: LucideIcon;
  dividerBefore?: boolean;
  danger?: boolean;
  onClick?: () => void;
  popover?: React.ReactNode;
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

const RadiusPopoverContent = ({
  radius,
  onSelect,
}: {
  radius: ContentImageRadiusType;
  onSelect: (r: ContentImageRadiusType) => void;
}) => (
  <div className="w-52">
    <p className="mb-2 px-1 text-xs font-semibold text-muted-foreground">
      Corner radius
    </p>
    <div className="flex flex-col">
      {contentImageRadius.map((r) => (
        <button
          key={r}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(r);
          }}
          className="flex items-center gap-3 rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
        >
          <span
            className="h-5 w-5 shrink-0 border-2 border-foreground/70"
            style={{ borderRadius: RADIUS_PX[r] }}
          />
          <span className="flex-1">
            {RADIUS_PX[r]}px{" "}
            <span className="text-muted-foreground">({r})</span>
          </span>
          {radius === r && <Check className="h-4 w-4 text-foreground" />}
        </button>
      ))}
    </div>
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
      tooltip: "Corner radius",
      icon: Squircle,
      popover: (
        <RadiusPopoverContent
          radius={radius}
          onSelect={(r) => {
            updateAttributes({ radius: r });
            setOpenKey(null);
          }}
        />
      ),
    },
    {
      key: "delete",
      tooltip: "Delete",
      icon: Trash2,
      dividerBefore: true,
      danger: true,
      onClick: handleDelete,
    },
  ];

  const showToolbar = (selected || openKey !== null) && !isUploading && !isError;

  return (
    <NodeViewWrapper className="relative my-4" data-drag-handle draggable="true">
      <div
        className={cn(
          "w-full min-h-12 border overflow-hidden relative transition-shadow",
          selected ? "border-sky-400 ring-2 ring-sky-400/40" : "border-[#d9d9d9]"
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
            <AlertCircle className="h-6 w-6 text-red-400" />
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
            className="absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-1 rounded-md border border-border bg-popover p-1 shadow-md"
            // Keep the ProseMirror node selected while using the toolbar.
            onMouseDown={(e) => e.preventDefault()}
          >
            {actions.map((action) => {
              const IconButton = (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "h-8 w-8",
                    action.danger && "text-red-600 hover:text-red-600"
                  )}
                  aria-label={action.tooltip}
                  onClick={action.onClick}
                >
                  <action.icon className="h-4 w-4" />
                </Button>
              );

              return (
                <Fragment key={action.key}>
                  {action.dividerBefore && (
                    <span className="mx-0.5 h-5 w-px bg-border" />
                  )}
                  {action.popover ? (
                    <Popover
                      open={openKey === action.key}
                      onOpenChange={(o) => setOpenKey(o ? action.key : null)}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <PopoverTrigger asChild>{IconButton}</PopoverTrigger>
                        </TooltipTrigger>
                        <TooltipContent>{action.tooltip}</TooltipContent>
                      </Tooltip>
                      <PopoverContent
                        align="center"
                        className="w-auto p-2"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        {action.popover}
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>{IconButton}</TooltipTrigger>
                      <TooltipContent>{action.tooltip}</TooltipContent>
                    </Tooltip>
                  )}
                </Fragment>
              );
            })}
          </div>
        </TooltipProvider>
      )}
    </NodeViewWrapper>
  );
};

export default ImageNodeView;
