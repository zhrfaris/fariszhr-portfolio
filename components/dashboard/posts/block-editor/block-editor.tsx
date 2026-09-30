"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import GlobalDragHandle from "tiptap-extension-global-drag-handle";
import { toast } from "sonner";

import { CloudinaryImage } from "./cloudinary-image";
import { SlashCommand } from "./slash-command";
import { uploadImageFile, isAcceptedImage } from "./upload";
import "./block-editor.css";

interface BlockEditorProps {
  initialHTML?: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const insertImageAttrs = (
  editor: Editor,
  attrs: Awaited<ReturnType<typeof uploadImageFile>>,
  pos?: number
) => {
  const node = {
    type: "image",
    attrs: {
      src: attrs.src,
      alt: "",
      publicId: attrs.publicId,
      placeholder: attrs.placeholder,
      thumbnail: attrs.thumbnail,
      width: attrs.width,
      height: attrs.height,
      imgType: attrs.imgType,
      radius: attrs.radius,
    },
  };

  if (typeof pos === "number") {
    editor.chain().focus().insertContentAt(pos, node).run();
  } else {
    editor.chain().focus().insertContent(node).run();
  }
};

const BlockEditor = ({
  initialHTML,
  onChange,
  placeholder = "Type '/' for commands…",
}: BlockEditorProps) => {
  const editorRef = useRef<Editor | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadAndInsert = useCallback(async (files: File[], pos?: number) => {
    const editor = editorRef.current;
    if (!editor) return;

    const images = files.filter(isAcceptedImage);
    if (images.length === 0) return;

    toast.loading("Uploading image...", { id: "block-editor-upload" });
    try {
      for (const file of images) {
        if (file.size > 10_000_000) {
          toast.error("File size must be less than 10MB");
          continue;
        }
        const attrs = await uploadImageFile(file);
        insertImageAttrs(editor, attrs, pos);
      }
      toast.success("Image uploaded");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image");
    } finally {
      toast.dismiss("block-editor-upload");
    }
  }, []);

  const openImagePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") return "Heading";
          return placeholder;
        },
        includeChildren: false,
      }),
      CloudinaryImage,
      SlashCommand.configure({
        onSelectImage: openImagePicker,
      }),
      GlobalDragHandle.configure({
        dragHandleWidth: 20,
      }),
    ],
    content: initialHTML || "",
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []);
        const images = files.filter(isAcceptedImage);
        if (images.length === 0) return false;
        event.preventDefault();
        void uploadAndInsert(images);
        return true;
      },
      handleDrop: (view, event) => {
        const files = Array.from(
          (event as DragEvent).dataTransfer?.files ?? []
        );
        const images = files.filter(isAcceptedImage);
        if (images.length === 0) return false;
        event.preventDefault();
        const coords = { left: event.clientX, top: event.clientY };
        const pos = view.posAtCoords(coords)?.pos;
        void uploadAndInsert(images, pos);
        return true;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    await uploadAndInsert(files);
  };

  return (
    <div className="block-editor-content">
      <EditorContent editor={editor} />
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
