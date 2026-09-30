"use client";

import React from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";

import { PostSection } from "@/actions/post/create/types";
import { Label } from "@/components/shadcn/label";
import { Button } from "@/components/shadcn/button";
import { usePostForm } from "@/hooks/use-post-form";
import SectionEditor from "./section-editor";

const ListPostSection = () => {
  const { sections, setSections, setDirty } = usePostForm((state) => state);

  const orderedSections = [...sections].sort((a, b) => a.order - b.order);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addSectionHandler = () => {
    const newSection: PostSection = {
      id: crypto.randomUUID(),
      order: sections.length,
      title: "",
      icon_type: "",
      contents: [],
    };
    setSections([...sections, newSection]);
    setDirty(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedSections.findIndex((s) => s.id === active.id);
    const newIndex = orderedSections.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(orderedSections, oldIndex, newIndex).map(
      (s, index) => ({ ...s, order: index })
    );
    setSections(reordered);
    setDirty(true);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-foreground/70">
        Section List
      </Label>
      <div className="flex flex-col gap-4 rounded-md border border-black/30 p-4">
        {orderedSections.length <= 0 && (
          <p className="w-full py-8 text-center text-muted-foreground">
            No section has been added to this post yet.
          </p>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={orderedSections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-4">
              {orderedSections.map((section) => (
                <SectionEditor key={section.id} section={section} />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div>
          <Button type="button" onClick={addSectionHandler}>
            <Plus className="mr-1 h-4 w-4" />
            Add {orderedSections.length > 0 ? "More" : ""} Section
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ListPostSection;
