"use client";

import React from "react";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { Trash2 } from "lucide-react";

import {
  contentImageRadius,
  ContentImageRadiusType,
} from "@/actions/post/create/schema";
import { getRadiusPx } from "@/lib/section-content";
import { cn } from "@/lib/utils";
import { deleteCloudinaryImage } from "./upload";

const ImageNodeView = ({
  node,
  updateAttributes,
  deleteNode,
  selected,
}: NodeViewProps) => {
  const { src, radius, publicId } = node.attrs as {
    src: string;
    radius: ContentImageRadiusType;
    publicId: string;
  };

  const handleDelete = () => {
    if (publicId) {
      // best-effort: remove from Cloudinary too
      void deleteCloudinaryImage(publicId);
    }
    deleteNode();
  };

  return (
    <NodeViewWrapper
      className="relative my-4"
      data-drag-handle
      draggable="true"
    >
      <div
        className={cn(
          "w-full min-h-12 border overflow-hidden relative transition-shadow",
          selected
            ? "border-sky-400 ring-2 ring-sky-400/40"
            : "border-[#d9d9d9]"
        )}
        style={{ borderRadius: getRadiusPx(radius) }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="w-full object-contain" />
      </div>

      {selected && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 rounded-md border border-border bg-popover p-1 shadow-md">
          {contentImageRadius.map((r) => (
            <button
              key={r}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                updateAttributes({ radius: r });
              }}
              className={cn(
                "px-2 py-1 text-xs rounded transition-colors",
                radius === r
                  ? "bg-foreground text-background"
                  : "hover:bg-muted"
              )}
            >
              {r}
            </button>
          ))}
          <span className="mx-1 h-4 w-px bg-border" />
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="p-1 rounded text-red-600 hover:bg-red-50"
            aria-label="Delete image"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </NodeViewWrapper>
  );
};

export default ImageNodeView;
