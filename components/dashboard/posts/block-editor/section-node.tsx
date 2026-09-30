"use client";

import React from "react";
import { Node, mergeAttributes, textblockTypeInputRule } from "@tiptap/core";
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewContent,
} from "@tiptap/react";

import { SECTION_MARKER_ATTR } from "@/lib/section-content";

/**
 * The Section block. Acts as a section divider/title inside the single-document
 * body. Styled like the public section header (small muted title + divider),
 * draggable like any other block, and serialized to
 * `<div data-section="true">Title</div>` so the body can be split into
 * post_sections on save.
 */
const SectionNodeView = () => {
  return (
    <NodeViewWrapper
      className="section-block mb-2 mt-6"
      data-drag-handle
      draggable="true"
    >
      <NodeViewContent
        as="h3"
        className="mb-3 text-[15px] font-normal text-foreground/80"
      />
      <hr className="border-[#e5e5e5]" contentEditable={false} />
    </NodeViewWrapper>
  );
};

export const SectionNode = Node.create({
  name: "section",
  group: "block",
  content: "text*",
  defining: true,
  draggable: true,

  parseHTML() {
    return [{ tag: `div[${SECTION_MARKER_ATTR}="true"]` }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { [SECTION_MARKER_ATTR]: "true" }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SectionNodeView);
  },

  addInputRules() {
    // "# " at the start of a block turns it into a Section (H1 is otherwise
    // unused because headings are limited to H2/H3).
    return [
      textblockTypeInputRule({
        find: /^#\s$/,
        type: this.type,
      }),
    ];
  },

  addKeyboardShortcuts() {
    return {
      // Enter inside a Section exits into a fresh paragraph below, rather than
      // splitting into another Section.
      Enter: () => {
        const { state } = this.editor;
        const { $head } = state.selection;
        if ($head.parent.type.name !== this.name) return false;

        const after = $head.after();
        return this.editor
          .chain()
          .insertContentAt(after, { type: "paragraph" })
          .setTextSelection(after + 1)
          .focus()
          .run();
      },
    };
  },
});
