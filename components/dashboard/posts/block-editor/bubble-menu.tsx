"use client";

import React, { useState } from "react";
import { BubbleMenu, Editor } from "@tiptap/react";
import { TextSelection } from "@tiptap/pm/state";
import { toast } from "sonner";
import {
  Bold,
  Check,
  ChevronDown,
  Code,
  Heading2,
  Heading3,
  Heading4,
  Italic,
  Link2,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  RemoveFormatting,
  Rows3,
  Strikethrough,
  Underline,
  Unlink,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type BlockType =
  | "paragraph"
  | "h2"
  | "h3"
  | "h4"
  | "section"
  | "bulletList"
  | "orderedList"
  | "blockquote";

const BLOCK_TYPES: { type: BlockType; label: string; icon: LucideIcon }[] = [
  { type: "paragraph", label: "Text", icon: Pilcrow },
  { type: "h2", label: "Heading 2", icon: Heading2 },
  { type: "h3", label: "Heading 3", icon: Heading3 },
  { type: "h4", label: "Heading 4", icon: Heading4 },
  { type: "section", label: "Section", icon: Rows3 },
  { type: "bulletList", label: "Bulleted list", icon: List },
  { type: "orderedList", label: "Numbered list", icon: ListOrdered },
  { type: "blockquote", label: "Quote", icon: Quote },
];

/** Innermost wrapper wins (a list inside a quote reads as a list). */
const currentBlockType = (editor: Editor): BlockType => {
  if (editor.isActive("bulletList")) return "bulletList";
  if (editor.isActive("orderedList")) return "orderedList";
  if (editor.isActive("blockquote")) return "blockquote";
  if (editor.isActive("section")) return "section";
  for (const level of [2, 3, 4] as const) {
    if (editor.isActive("heading", { level })) return `h${level}`;
  }
  return "paragraph";
};

/** Unwrap lists/quotes back to plain paragraphs first, so every conversion
 * starts from the same shape. Section keeps its existing serialization; its
 * `marks: ""` spec strips formatting when text is turned into a Section. */
const turnInto = (editor: Editor, type: BlockType) => {
  const chain = editor.chain().focus().clearNodes();
  switch (type) {
    case "paragraph":
      return chain.run();
    case "h2":
    case "h3":
    case "h4":
      return chain
        .setNode("heading", { level: Number(type[1]) as 2 | 3 | 4 })
        .run();
    case "section":
      return chain.setNode("section").run();
    case "bulletList":
      return chain.toggleBulletList().run();
    case "orderedList":
      return chain.toggleOrderedList().run();
    case "blockquote":
      return chain.toggleBlockquote().run();
  }
};

/** Accept http(s), mailto, and site-relative links; add https:// to bare
 * domains. Returns null for anything else (e.g. javascript:). */
const normalizeHref = (raw: string): string | null => {
  const url = raw.trim();
  if (/^(https?:\/\/|mailto:|\/|#)/i.test(url)) return url;
  if (/^[^\s:/]+\.[^\s]+$/.test(url)) return `https://${url}`;
  return null;
};

/**
 * Notion-style bubble menu shown over a text selection: a "Turn into" block
 * type dropdown plus inline formatting (bold, italic, underline, strike, code,
 * link, clear). Menus render inside the bubble (no portals) so focusing them
 * doesn't blur the editor out from under the selection.
 */
export default function EditorBubbleMenu({ editor }: { editor: Editor }) {
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("");

  const resetMenus = () => {
    setTypeMenuOpen(false);
    setLinkOpen(false);
  };

  const active = currentBlockType(editor);
  const activeLabel =
    BLOCK_TYPES.find((b) => b.type === active)?.label ?? "Text";
  // Section titles are stored as plain text, so formatting is unavailable.
  const marksDisabled = active === "section";
  const linkActive = editor.isActive("link");

  const openLink = () => {
    setTypeMenuOpen(false);
    setLinkValue(editor.getAttributes("link").href ?? "");
    setLinkOpen(true);
  };

  const applyLink = () => {
    if (!linkValue.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setLinkOpen(false);
      return;
    }
    const href = normalizeHref(linkValue);
    if (!href) {
      toast.error("Enter a valid URL (https://…, mailto:… or /path)");
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    setLinkOpen(false);
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkOpen(false);
  };

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="formatBubbleMenu"
      tippyOptions={{
        duration: 100,
        placement: "top-start",
        maxWidth: "none",
        onHidden: resetMenus,
      }}
      shouldShow={({ editor, view, state, from, to }) => {
        const { selection } = state;
        if (!editor.isEditable || !view.hasFocus()) return false;
        if (!(selection instanceof TextSelection) || selection.empty)
          return false;
        if (!state.doc.textBetween(from, to).length) return false;
        return !editor.isActive("codeBlock");
      }}
    >
      <div
        data-editor-ui
        // Keep the editor selection while clicking menu buttons.
        onMouseDown={(e) => {
          if (!(e.target as HTMLElement).closest("input")) e.preventDefault();
        }}
        className="relative flex items-center gap-0.5 rounded-lg border bg-popover p-1 text-sm text-popover-foreground shadow-md"
      >
        {linkOpen ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyLink();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  setLinkOpen(false);
                  editor.commands.focus();
                }
              }}
              placeholder="Paste or type a link"
              className="h-8 w-60 rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <MenuButton label="Apply link" onClick={applyLink}>
              <Check className="size-4" />
            </MenuButton>
            {linkActive && (
              <MenuButton label="Remove link" onClick={removeLink}>
                <Unlink className="size-4" />
              </MenuButton>
            )}
          </div>
        ) : (
          <>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={typeMenuOpen}
              onClick={() => setTypeMenuOpen((o) => !o)}
              className="flex h-8 items-center gap-1 rounded-md px-2 font-medium hover:bg-muted"
            >
              {activeLabel}
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </button>

            <span className="mx-0.5 h-5 w-px bg-border" />

            <MarkButton
              label="Bold"
              icon={Bold}
              active={editor.isActive("bold")}
              disabled={marksDisabled}
              onClick={() => editor.chain().focus().toggleBold().run()}
            />
            <MarkButton
              label="Italic"
              icon={Italic}
              active={editor.isActive("italic")}
              disabled={marksDisabled}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            />
            <MarkButton
              label="Underline"
              icon={Underline}
              active={editor.isActive("underline")}
              disabled={marksDisabled}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            />
            <MarkButton
              label="Strikethrough"
              icon={Strikethrough}
              active={editor.isActive("strike")}
              disabled={marksDisabled}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            />
            <MarkButton
              label="Inline code"
              icon={Code}
              active={editor.isActive("code")}
              disabled={marksDisabled}
              onClick={() => editor.chain().focus().toggleCode().run()}
            />
            <MarkButton
              label={linkActive ? "Edit link" : "Add link"}
              icon={Link2}
              active={linkActive}
              disabled={marksDisabled}
              onClick={openLink}
            />

            <span className="mx-0.5 h-5 w-px bg-border" />

            <MarkButton
              label="Clear format"
              icon={RemoveFormatting}
              disabled={marksDisabled}
              onClick={() => editor.chain().focus().unsetAllMarks().run()}
            />
          </>
        )}

        {typeMenuOpen && !linkOpen && (
          <div
            role="menu"
            className="absolute left-0 top-full z-10 mt-1 w-48 rounded-lg border bg-popover p-1 shadow-lg"
          >
            <p className="px-2 py-1 text-xs text-muted-foreground">Turn into</p>
            {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                type="button"
                role="menuitemradio"
                aria-checked={active === type}
                onClick={() => {
                  turnInto(editor, type);
                  setTypeMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted"
              >
                <Icon className="size-4 text-muted-foreground" />
                <span className="flex-1">{label}</span>
                {active === type && <Check className="size-4" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </BubbleMenu>
  );
}

function MenuButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-8 items-center justify-center rounded-md hover:bg-muted disabled:pointer-events-none disabled:opacity-40",
        active && "bg-muted text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function MarkButton({
  icon: Icon,
  ...props
}: {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <MenuButton {...props}>
      <Icon className="size-4" />
    </MenuButton>
  );
}
