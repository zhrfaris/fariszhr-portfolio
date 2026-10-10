"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import { EditorView } from "@tiptap/pm/view";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import GlobalDragHandle from "tiptap-extension-global-drag-handle";
import { toast } from "sonner";

import EditorBubbleMenu from "./bubble-menu";
import { CloudinaryImage } from "./cloudinary-image";
import { SectionNode } from "./section-node";
import { SlashCommand } from "./slash-command";
import { TrailingNode } from "./trailing-node";
import { isAcceptedImage } from "./upload";
import { createUploadTask } from "./upload-manager";
import "./block-editor.css";

interface BlockEditorProps {
  initialHTML?: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const BlockEditor = ({
  initialHTML,
  onChange,
  placeholder = "Type '/' for commands…",
}: BlockEditorProps) => {
  const editorRef = useRef<Editor | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Insert each image immediately with its local object-URL preview + a
  // transient uploadId; the node view drives the upload/progress from there.
  const uploadAndInsert = useCallback((files: File[], pos?: number) => {
    const editor = editorRef.current;
    if (!editor) return;

    const images = files.filter(isAcceptedImage);
    if (images.length === 0) return;

    if (typeof pos === "number") {
      editor.chain().focus(pos).run();
    } else {
      editor.chain().focus().run();
    }

    for (const file of images) {
      if (file.size > 10_000_000) {
        toast.error(`"${file.name}" exceeds the 10MB limit`);
        continue;
      }
      const { id, objectUrl } = createUploadTask(file);
      editor
        .chain()
        .focus()
        .insertContent({
          type: "image",
          attrs: { src: objectUrl, alt: "", uploadId: id },
        })
        .run();
    }
  }, []);

  const openImagePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // The editor is created once. Its options MUST stay reference-stable across
  // re-renders: @tiptap/react re-applies editor.setOptions() on every render
  // whenever it detects an option changed, and re-applying view props mid-typing
  // drops the caret. So the extensions array and editorProps are memoized once.
  // `placeholder` and the upload callbacks are captured on first mount by design.
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "section") return "Section title";
          if (node.type.name === "heading") return "Heading";
          return placeholder;
        },
        includeChildren: false,
      }),
      SectionNode,
      CloudinaryImage,
      SlashCommand.configure({
        onSelectImage: openImagePicker,
      }),
      GlobalDragHandle.configure({
        dragHandleWidth: 20,
        // Auto-scroll the window when dragging near the top/bottom viewport edge
        // (the dashboard scrolls on the window). Key name matches the library.
        scrollTreshold: 100,
      }),
      TrailingNode,
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const editorProps = useMemo(
    () => ({
      attributes: {
        class: "focus:outline-none",
      },
      handlePaste: (_view: unknown, event: ClipboardEvent) => {
        const files = Array.from(event.clipboardData?.files ?? []);
        const images = files.filter(isAcceptedImage);
        if (images.length === 0) return false;
        event.preventDefault();
        uploadAndInsert(images);
        return true;
      },
      handleDrop: (view: EditorView, event: DragEvent) => {
        const files = Array.from(event.dataTransfer?.files ?? []);
        const images = files.filter(isAcceptedImage);
        if (images.length === 0) return false;
        event.preventDefault();
        const coords = { left: event.clientX, top: event.clientY };
        const pos = view.posAtCoords(coords)?.pos;
        uploadAndInsert(images, pos);
        return true;
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Seeded once; changing content later would reset the cursor, so we never do.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialContent = useMemo(() => initialHTML || "", []);

  // onChange identity may change per render, but Tiptap always calls the latest
  // onUpdate via its internal options ref, so this stays current without churn.
  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: initialContent,
    editorProps,
    onCreate: ({ editor }) => {
      // appendTransaction (TrailingNode) only runs on transactions, not the
      // initial doc — dispatch an empty tr so a doc that loads ending with an
      // image still gets its trailing empty paragraph.
      editor.view.dispatch(editor.state.tr);
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    uploadAndInsert(files);
  };

  // Clicking the empty area below the last block (the container's bottom padding)
  // focuses the end of the document, adding an empty paragraph if the last block
  // is not already one. It must NOT interfere with the drag handle, toolbar,
  // slash menu, dropdowns/popovers, or any click that lands inside the content.
  const handleContainerMouseDown = (e: React.MouseEvent) => {
    const editor = editorRef.current;
    if (!editor) return;

    const target = e.target as HTMLElement | null;
    const pmRoot = editor.view.dom as HTMLElement;

    // Ignore clicks inside the content itself.
    if (target && pmRoot.contains(target)) return;

    // Ignore clicks on any editor UI living outside the content (drag handle in
    // the gutter, floating toolbar, slash menu, popovers/dropdowns).
    if (
      target?.closest?.(
        '[data-drag-handle], [data-editor-ui], .drag-handle, [role="menu"], [role="dialog"], [data-radix-popper-content-wrapper]'
      )
    ) {
      return;
    }

    // Only act when the click is genuinely below the last block.
    const lastBlock = pmRoot.lastElementChild as HTMLElement | null;
    if (!lastBlock) return;
    if (e.clientY <= lastBlock.getBoundingClientRect().bottom) return;

    e.preventDefault();
    const { state } = editor;
    const last = state.doc.lastChild;
    const isEmptyParagraph =
      last?.type.name === "paragraph" && last.content.size === 0;
    if (!isEmptyParagraph) {
      editor
        .chain()
        .insertContentAt(state.doc.content.size, { type: "paragraph" })
        .run();
    }
    editor.commands.focus("end");
  };

  return (
    <div className="block-editor-content" onMouseDown={handleContainerMouseDown}>
      <EditorContent editor={editor} />
      {editor && <EditorBubbleMenu editor={editor} />}
      <input
        ref={fileInputRef}
        onChange={onFileChange}
        type="file"
        className="hidden"
        accept=".png, .jpg, .jpeg, .gif, .svg"
      />
    </div>
  );
};

export default BlockEditor;
