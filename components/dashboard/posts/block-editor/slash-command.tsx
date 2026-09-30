"use client";

import { Extension, Range } from "@tiptap/core";
import Suggestion, {
  SuggestionOptions,
  SuggestionProps,
  SuggestionKeyDownProps,
} from "@tiptap/suggestion";
import { ReactRenderer, Editor } from "@tiptap/react";
import tippy, { Instance as TippyInstance } from "tippy.js";
import {
  Heading2,
  Heading3,
  Image as ImageIcon,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Rows3,
  type LucideIcon,
} from "lucide-react";

import SlashMenu, { SlashMenuRef } from "./slash-menu";

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: LucideIcon;
  command: (props: { editor: Editor; range: Range }) => void;
}

interface SlashCommandOptions {
  onSelectImage: () => void;
}

const buildItems = (
  options: SlashCommandOptions
): ((query: string) => SlashCommandItem[]) => {
  const items: SlashCommandItem[] = [
    {
      title: "Section",
      description: "Section divider with a title",
      icon: Rows3,
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setNode("section").run(),
    },
    {
      title: "Paragraph",
      description: "Plain text",
      icon: Pilcrow,
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setParagraph().run(),
    },
    {
      title: "Heading 2",
      description: "Large section heading",
      icon: Heading2,
      command: ({ editor, range }) =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 2 })
          .run(),
    },
    {
      title: "Heading 3",
      description: "Medium section heading",
      icon: Heading3,
      command: ({ editor, range }) =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 3 })
          .run(),
    },
    {
      title: "Bullet List",
      description: "Unordered list",
      icon: List,
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleBulletList().run(),
    },
    {
      title: "Numbered List",
      description: "Ordered list",
      icon: ListOrdered,
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
    },
    {
      title: "Quote",
      description: "Capture a quote",
      icon: Quote,
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
    },
    {
      title: "Divider",
      description: "Horizontal rule",
      icon: Minus,
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
    },
    {
      title: "Image",
      description: "Upload an image",
      icon: ImageIcon,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run();
        options.onSelectImage();
      },
    },
  ];

  return (query: string) => {
    const q = query.toLowerCase().trim();
    if (!q) return items;
    return items.filter((item) => item.title.toLowerCase().includes(q));
  };
};

const renderSuggestion: SuggestionOptions<SlashCommandItem>["render"] = () => {
  let component: ReactRenderer<SlashMenuRef> | null = null;
  let popup: TippyInstance[] | null = null;

  return {
    onStart: (props: SuggestionProps<SlashCommandItem>) => {
      component = new ReactRenderer(SlashMenu, {
        props,
        editor: props.editor,
      });

      if (!props.clientRect) return;

      popup = tippy("body", {
        getReferenceClientRect: props.clientRect as () => DOMRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: "manual",
        placement: "bottom-start",
      });
    },
    onUpdate: (props: SuggestionProps<SlashCommandItem>) => {
      component?.updateProps(props);
      if (!props.clientRect) return;
      popup?.[0]?.setProps({
        getReferenceClientRect: props.clientRect as () => DOMRect,
      });
    },
    onKeyDown: (props: SuggestionKeyDownProps) => {
      if (props.event.key === "Escape") {
        popup?.[0]?.hide();
        return true;
      }
      return component?.ref?.onKeyDown(props) ?? false;
    },
    onExit: () => {
      popup?.[0]?.destroy();
      component?.destroy();
      popup = null;
      component = null;
    },
  };
};

export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: "slashCommand",

  addOptions() {
    return {
      onSelectImage: () => {},
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion<SlashCommandItem>({
        editor: this.editor,
        char: "/",
        startOfLine: false,
        allowSpaces: false,
        items: ({ query }) => buildItems(this.options)(query),
        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },
        render: renderSuggestion,
      }),
    ];
  },
});
