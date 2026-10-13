"use client";

import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  DndContext,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";

import { GalleryPhoto } from "@/actions/gallery/get/types";
import { IconAction } from "@/components/dashboard/icon-action";
import AlertDialogWrapper from "@/components/wrappers/alert-dialog-wrapper";
import { cldUrl } from "@/lib/landing";
import { cn } from "@/lib/utils";

/*
 * The live Photography grid (components/landing/photo-grid.tsx +
 * landing.module.css `.photoGrid`): justified rows. Each photo is a flex item
 * with basis = row height × its aspect ratio and grow = its aspect ratio,
 * wrapping row-first, and a trailing spacer keeps the last row from
 * stretching. On desktop the grid is 832px wide with 90px rows and 4px gaps.
 *
 * Here the same layout is scaled to the card's width: row and gap shrink by
 * the same factor (CSS container units, 100cqw = this grid's width), so every
 * row breaks after the same photos and photo #n sits where it does on
 * /photography.
 */
const LIVE_WIDTH = 832;
const LIVE_ROW = 90;
const LIVE_GAP = 4;
/** The live grid's ratio for a photo without dimensions. */
const FALLBACK_RATIO = 1.5;

const ratioOf = (p: GalleryPhoto) => {
  const { img_width, img_height } = p.image;
  return img_width && img_height ? img_width / img_height : FALLBACK_RATIO;
};

/** No transforms: the list itself is reordered while dragging, so the photos
 * reflow in the real layout. */
const noTransforms = () => null;

export default function LivePhotoGrid({
  photos,
  onReorder,
  onDelete,
}: {
  photos: GalleryPhoto[];
  /** A drag finished with a new order. */
  onReorder: (next: GalleryPhoto[], previous: GalleryPhoto[]) => void;
  onDelete: (photo: GalleryPhoto) => void;
}) {
  // Live sizes × (this grid's width / the live grid's width).
  const unit = (px: number) => `calc(100cqw * ${px} / ${LIVE_WIDTH})`;

  // The order shown; while dragging it moves ahead of `photos`.
  const [items, setItems] = useState(photos);
  const [activeId, setActiveId] = useState<string | null>(null);
  useEffect(() => {
    if (!activeId) setItems(photos);
  }, [photos, activeId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragStart = ({ active }: DragStartEvent) =>
    setActiveId(String(active.id));

  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const from = prev.findIndex((p) => p.id === active.id);
      const to = prev.findIndex((p) => p.id === over.id);
      return from < 0 || to < 0 ? prev : arrayMove(prev, from, to);
    });
  };

  const onDragEnd = () => {
    setActiveId(null);
    const moved = items.some((p, i) => p.id !== photos[i]?.id);
    if (moved) onReorder(items, photos);
  };

  const onDragCancel = () => {
    setActiveId(null);
    setItems(photos);
  };

  const active = items.find((p) => p.id === activeId);

  return (
    <DndContext
      id="photo-works-order"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <SortableContext items={items.map((p) => p.id)} strategy={noTransforms}>
        <div className="[container-type:inline-size]">
          <div
            className="flex flex-wrap"
            style={{ gap: unit(LIVE_GAP) }}
            aria-label="Photos, in Photography page order"
          >
            {items.map((photo, index) => (
              <Tile
                key={photo.id}
                photo={photo}
                index={index}
                basis={(ratio: number) => unit(LIVE_ROW * ratio)}
                onDelete={() => onDelete(photo)}
              />
            ))}
            {/* The live grid's ::after spacer */}
            <div aria-hidden style={{ flexGrow: 999999 }} />
          </div>
        </div>
      </SortableContext>

      <DragOverlay>
        {active ? (
          <div className="relative size-full overflow-hidden rounded-sm border bg-muted shadow-float">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cldUrl(active.image.img_url, "h_280,c_limit,q_auto,f_auto")}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function Tile({
  photo,
  index,
  basis,
  onDelete,
}: {
  photo: GalleryPhoto;
  index: number;
  /** flex-basis for a given aspect ratio */
  basis: (ratio: number) => string;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: photo.id,
  });
  const ratio = ratioOf(photo);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      aria-label={`Photo ${index + 1}. Press Space to move it.`}
      className={cn(
        "group relative cursor-grab touch-none overflow-hidden bg-muted outline-none focus-visible:ring-focus focus-visible:ring-ring active:cursor-grabbing",
        isDragging && "ring-2 ring-primary"
      )}
      style={{ flexGrow: ratio, flexBasis: basis(ratio) }}
    >
      {/* Height from the width and ratio, as on the live grid */}
      <i
        aria-hidden
        className="block"
        style={{ paddingBottom: `${100 / ratio}%` }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cldUrl(photo.image.img_url, "h_280,c_limit,q_auto,f_auto")}
        alt=""
        loading="lazy"
        draggable={false}
        className={cn(
          "absolute inset-0 size-full object-cover",
          isDragging && "opacity-30"
        )}
      />
      <span className="absolute left-1 top-1 rounded-sm bg-black/60 px-1 text-[10px] font-medium leading-4 text-white">
        {index + 1}
      </span>

      {/* Remove: top-right, on hover or keyboard focus. Kept out of the
          drag gestures and keys. */}
      <div
        className="absolute right-1 top-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100"
        onPointerDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <AlertDialogWrapper
          header="Delete photo?"
          description="It will be removed from the Photo works grid and from storage. This can't be undone."
          proceedHandler={onDelete}
        >
          <IconAction
            aria-label={`Delete photo ${index + 1}`}
            title="Remove photo"
            destructive
          >
            <Trash2 />
          </IconAction>
        </AlertDialogWrapper>
      </div>
    </div>
  );
}
