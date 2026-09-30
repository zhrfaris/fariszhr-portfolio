"use client";

import React, { useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";

import { PostSection } from "@/actions/post/create/types";
import { usePostForm } from "@/hooks/use-post-form";
import { contentsToHtml, htmlToContents } from "@/lib/section-content";
import { cn } from "@/lib/utils";
import { Input } from "@/components/shadcn/input";
import { Button } from "@/components/shadcn/button";
import FormSelectIcon from "@/components/form/form-select-icon";
import BlockEditor from "./block-editor/block-editor";

const SectionEditor = ({ section }: { section: PostSection }) => {
  const { sections, setSections, setDirty } = usePostForm((state) => state);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  // Only the FIRST render seeds the editor; subsequent store updates must not
  // reset the editor content (it owns its own document afterwards).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialHTML = useMemo(() => contentsToHtml(section.contents), []);

  const updateSection = (patch: Partial<PostSection>) => {
    setSections(
      sections.map((s) => (s.id === section.id ? { ...s, ...patch } : s))
    );
    setDirty(true);
  };

  const handleEditorChange = (html: string) => {
    updateSection({ contents: htmlToContents(html, section.contents) });
  };

  const handleDelete = () => {
    const updated = sections
      .filter((s) => s.id !== section.id)
      .map((s, index) => ({ ...s, order: index }));
    setSections(updated);
    setDirty(true);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative rounded-md border border-black/30 bg-background p-4",
        isDragging && "z-10 opacity-70 shadow-lg"
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          className="cursor-grab rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
          aria-label="Drag to reorder section"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <FormSelectIcon
          id={`icon-${section.id}`}
          defaultValue={section.icon_type}
          onChange={(icon) => updateSection({ icon_type: icon })}
        />

        <Input
          defaultValue={section.title}
          onChange={(e) => updateSection({ title: e.target.value })}
          placeholder="Section title"
          className="flex-1"
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          aria-label="Delete section"
        >
          <Trash2 className="text-red-600" />
        </Button>
      </div>

      <div className="rounded-md border border-input px-3 py-2">
        <BlockEditor
          initialHTML={initialHTML}
          onChange={handleEditorChange}
        />
      </div>
    </div>
  );
};

export default SectionEditor;
