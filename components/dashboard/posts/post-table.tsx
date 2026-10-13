"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, GripVertical, Pen, Plus, Trash } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  Modifier,
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Post } from "@/actions/post/get/types";
import { deletePost } from "@/actions/post/delete";
import { reorderPost } from "@/actions/post/reorder";
import { Status } from "@/actions/types";
import { IconAction } from "@/components/dashboard/icon-action";
import { buttonVariants } from "@/components/shadcn/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";
import AlertDialogWrapper from "@/components/wrappers/alert-dialog-wrapper";
import { useAction } from "@/hooks/use-action";
import { capitalizeEachWord, cn } from "@/lib/utils";
import StatusBadge from "../status-badge";

type Row = NonNullable<Post>;

/** [handle] Title · Categories · Workplace · Status · Actions. Title gets the
 * most room; Status and Actions are fixed. The header, each row and the lifted
 * copy are separate grids on this template, so no track may size to its
 * content: that keeps every header over its column. */
const GRID =
  "grid grid-cols-[24px_minmax(0,2.2fr)_minmax(0,1.3fr)_minmax(0,1fr)_56px_108px] gap-x-3 px-2";

/** Rows only move up and down. */
const restrictToVerticalAxis: Modifier = ({ transform }) => ({
  ...transform,
  x: 0,
});

/**
 * All case studies: a short list (a handful of posts), so no paging, sorting,
 * filtering or selection. Rows are dragged by their handle (or moved with the
 * keyboard: Space, arrows, Space / Esc) to set the order the public portfolio
 * uses; clicking a row opens the editor.
 */
export const PostTable = ({ data }: { data: Row[] }) => {
  const router = useRouter();
  const [posts, setPosts] = useState<Row[]>(data);
  const [activeId, setActiveId] = useState<string | null>(null);

  // `order` as last saved, per post: what a save is compared against.
  const savedOrder = useRef<Map<string, number | null>>(new Map());
  // The list to restore if a reorder fails.
  const rollback = useRef<Row[] | null>(null);

  useEffect(() => {
    setPosts(data);
    savedOrder.current = new Map(data.map((p) => [p.id, p.order]));
  }, [data]);

  const { execute: executeReorder } = useAction(reorderPost, {
    onSuccess: (saved) => {
      saved.forEach((p) => savedOrder.current.set(p.id, p.order));
      rollback.current = null;
      toast.success("Order saved");
    },
    onError: (error) => {
      if (rollback.current) setPosts(rollback.current);
      rollback.current = null;
      toast.error(error || "Couldn't save the order");
    },
  });

  const { execute: executeDelete } = useAction(deletePost, {
    onProceed: () => {
      toast.loading("Deleting post...", { id: "loading-delete-post" });
    },
    onSuccess: () => {
      toast.success("Post deleted!");
    },
    onError: (error) => {
      toast.error(error);
    },
    onComplete() {
      toast.dismiss("loading-delete-post");
    },
  });

  /** Positions become `order` (0…n-1). Only posts whose order changed are
   * sent, through the same reorder action the old Reorder mode used. */
  const saveOrder = (next: Row[], previous: Row[]) => {
    const indexed = next.map((p, index) => ({ ...p, order: index }));
    const changed = indexed
      .filter((p) => savedOrder.current.get(p.id) !== p.order)
      .map((p) => ({ id: p.id, order: p.order }));
    setPosts(indexed);
    if (changed.length === 0) return;
    rollback.current = previous;
    void executeReorder(changed);
  };

  // As before: the remaining posts close the gap (re-indexed and saved).
  const onDelete = (post: Row) => {
    const remaining = posts.filter((p) => p.id !== post.id);
    saveOrder(remaining, posts);
    void executeDelete({ id: post.id });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragStart = ({ active }: DragStartEvent) =>
    setActiveId(String(active.id));

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const from = posts.findIndex((p) => p.id === active.id);
    const to = posts.findIndex((p) => p.id === over.id);
    saveOrder(arrayMove(posts, from, to), posts);
  };

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">No case studies yet.</p>
        <Link href="/dashboard/posts/create" className={buttonVariants()}>
          <Plus />
          New case study
        </Link>
      </div>
    );
  }

  const activePost = posts.find((p) => p.id === activeId);

  return (
    <TooltipProvider delayDuration={200}>
      <div role="table" aria-label="Case studies" className="-mx-2">
        <div role="rowgroup">
          <div
            role="row"
            className={cn(
              GRID,
              "h-10 items-center text-[13px] font-medium text-muted-foreground"
            )}
          >
            <span role="columnheader">
              <span className="sr-only">Reorder</span>
            </span>
            <span role="columnheader">Title</span>
            <span role="columnheader">Categories</span>
            <span role="columnheader">Workplace</span>
            <span role="columnheader">Status</span>
            <span role="columnheader" className="w-[108px]">
              Actions
            </span>
          </div>
        </div>

        <DndContext
          // Fixed id: dnd-kit's generated one differs between server and
          // client renders (hydration mismatch on aria-describedby).
          id="case-studies-order"
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <SortableContext
            items={posts.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div role="rowgroup">
              {posts.map((post) => (
                <SortableRow
                  key={post.id}
                  post={post}
                  onOpen={() =>
                    router.push(`/dashboard/posts/${post.slug}/edit`)
                  }
                  onDelete={() => onDelete(post)}
                />
              ))}
            </div>
          </SortableContext>

          {/* The lifted row follows the pointer; its slot in the list (with
              the accent line) shows where it will land. */}
          <DragOverlay>
            {activePost ? (
              <div className="rounded-md border bg-background shadow-float">
                <RowCells post={activePost} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </TooltipProvider>
  );
};

function SortableRow({
  post,
  onOpen,
  onDelete,
}: {
  post: Row;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: post.id });

  return (
    <div
      ref={setNodeRef}
      role="row"
      style={{ transform: CSS.Translate.toString(transform), transition }}
      onClick={(e) => {
        // Only clicks on the row itself: the handle and actions stop
        // propagation, and dialogs portaled out of the row don't count.
        if (!e.currentTarget.contains(e.target as Node)) return;
        onOpen();
      }}
      className={cn(
        "relative cursor-pointer border-b last:border-b-0 hover:bg-muted",
        isDragging && "cursor-grabbing hover:bg-transparent"
      )}
    >
      {isDragging ? (
        // Drop position: the row's slot, marked with a 2px accent line.
        <div className="relative" aria-hidden>
          <div className="invisible">
            <RowCells post={post} />
          </div>
          <div className="absolute inset-x-2 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-primary" />
        </div>
      ) : (
        <RowCells
          post={post}
          handle={
            <button
              type="button"
              ref={setActivatorNodeRef}
              {...attributes}
              {...listeners}
              aria-label={`Reorder ${post.title}`}
              onClick={(e) => e.stopPropagation()}
              className="flex size-6 cursor-grab touch-none items-center justify-center rounded-sm text-tertiary-foreground outline-none hover:text-muted-foreground focus-visible:ring-focus focus-visible:ring-ring active:cursor-grabbing"
            >
              <GripVertical className="size-4" />
            </button>
          }
          actions={<RowActions post={post} onDelete={onDelete} />}
        />
      )}
    </div>
  );
}

/** One row's cells; also used for the lifted copy while dragging. */
function RowCells({
  post,
  handle,
  actions,
}: {
  post: Row;
  handle?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className={cn(GRID, "items-start py-3 text-sm")}>
      <div role="cell" className="flex h-8 items-center">
        {handle ?? (
          <span className="flex size-6 items-center justify-center text-tertiary-foreground">
            <GripVertical className="size-4" />
          </span>
        )}
      </div>
      <div role="cell" className="flex min-h-8 min-w-0 items-center">
        <Link
          href={`/dashboard/posts/${post.slug}/edit`}
          onClick={(e) => e.stopPropagation()}
          className="break-words rounded-sm font-medium text-foreground outline-none focus-visible:ring-focus focus-visible:ring-ring"
        >
          {post.title}
        </Link>
      </div>
      <div
        role="cell"
        className="flex min-h-8 min-w-0 items-center break-words text-muted-foreground"
      >
        {post.categories?.map((c) => c.name).join(", ") || "—"}
      </div>
      <div
        role="cell"
        className="flex min-h-8 min-w-0 items-center break-words text-muted-foreground"
      >
        {post.workplace?.name ? capitalizeEachWord(post.workplace.name) : "—"}
      </div>
      <div role="cell" className="flex h-8 items-center">
        <StatusBadge live={post.status === Status.Values.ACTIVE} />
      </div>
      <div role="cell" className="flex h-8 w-[108px] items-center">
        {actions}
      </div>
    </div>
  );
}

function RowActions({ post, onDelete }: { post: Row; onDelete: () => void }) {
  const live = post.status === Status.Values.ACTIVE;

  return (
    <div
      className="flex items-center gap-1.5"
      onClick={(e) => e.stopPropagation()}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          {live ? (
            <IconAction aria-label="View live" asChild>
              <Link
                href={`/portfolios/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Eye />
              </Link>
            </IconAction>
          ) : (
            // Disabled buttons get no pointer events, so the tooltip hangs on
            // a focusable wrapper.
            <span
              tabIndex={0}
              className="rounded-md outline-none focus-visible:ring-focus focus-visible:ring-ring"
            >
              <IconAction aria-label="View live" disabled>
                <Eye />
              </IconAction>
            </span>
          )}
        </TooltipTrigger>
        <TooltipContent>
          {live ? "View live" : "Not published yet"}
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <IconAction aria-label="Edit" asChild>
            <Link href={`/dashboard/posts/${post.slug}/edit`}>
              <Pen />
            </Link>
          </IconAction>
        </TooltipTrigger>
        <TooltipContent>Edit</TooltipContent>
      </Tooltip>

      <Tooltip>
        <AlertDialogWrapper
          header="Delete Post?"
          description="You will permanently delete the selected Post, this action can not be undone!"
          proceedHandler={onDelete}
        >
          <TooltipTrigger asChild>
            <IconAction aria-label="Delete" destructive>
              <Trash />
            </IconAction>
          </TooltipTrigger>
        </AlertDialogWrapper>
        <TooltipContent>Delete</TooltipContent>
      </Tooltip>
    </div>
  );
}
