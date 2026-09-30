import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import {
  NodeSelection,
  Selection,
  TextSelection,
} from "@tiptap/pm/state";

import { IMAGE_ATTR, DEFAULT_INLINE_RADIUS } from "@/lib/section-content";
import ImageNodeView from "./image-node-view";

const numberAttr = (attrName: string) => ({
  default: null as number | null,
  parseHTML: (element: HTMLElement) => {
    const value = element.getAttribute(attrName);
    return value ? parseInt(value, 10) : null;
  },
  renderHTML: (attributes: Record<string, unknown>) => {
    const value = attributes[camelKey(attrName)];
    return value ? { [attrName]: String(value) } : {};
  },
});

const stringAttr = (attrName: string, fallback = "") => ({
  default: fallback,
  parseHTML: (element: HTMLElement) =>
    element.getAttribute(attrName) || fallback,
  renderHTML: (attributes: Record<string, unknown>) => {
    const value = attributes[camelKey(attrName)];
    return value ? { [attrName]: String(value) } : {};
  },
});

// data-public-id -> publicId
function camelKey(dataAttr: string) {
  return dataAttr
    .replace(/^data-/, "")
    .replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

/**
 * Custom image node that stores the Cloudinary metadata as attributes so the
 * serialized HTML carries everything the public page needs (blur placeholder,
 * intrinsic size, radius, public_id). Extends the base Image extension so
 * pasted/markdown images still resolve to this node.
 */
export const CloudinaryImage = Image.extend({
  name: "image",
  draggable: true,

  addAttributes() {
    return {
      ...this.parent?.(),
      publicId: stringAttr(IMAGE_ATTR.publicId),
      placeholder: stringAttr(IMAGE_ATTR.placeholder),
      thumbnail: stringAttr(IMAGE_ATTR.thumbnail),
      imgType: stringAttr(IMAGE_ATTR.imgType),
      width: numberAttr(IMAGE_ATTR.width),
      height: numberAttr(IMAGE_ATTR.height),
      // Transient: links the node to an in-flight upload task. `rendered: false`
      // keeps it out of the serialized HTML so it is never saved.
      uploadId: {
        default: null as string | null,
        rendered: false,
      },
      radius: {
        default: DEFAULT_INLINE_RADIUS,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute(IMAGE_ATTR.radius) || DEFAULT_INLINE_RADIUS,
        renderHTML: (attributes: Record<string, unknown>) => ({
          [IMAGE_ATTR.radius]:
            (attributes.radius as string) || DEFAULT_INLINE_RADIUS,
        }),
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },

  addKeyboardShortcuts() {
    const isImageSelected = () => {
      const { selection } = this.editor.state;
      return (
        selection instanceof NodeSelection &&
        selection.node.type.name === this.name
      );
    };

    const paragraph = () => this.editor.schema.nodes.paragraph;

    // Move to the block below (creating a trailing paragraph if the image is the
    // last block), or above.
    const move = (dir: "up" | "down") => {
      if (!isImageSelected()) return false;
      const { state, view } = this.editor;
      const { selection, doc } = state;

      if (dir === "down") {
        const after = selection.to;
        if (after >= doc.content.size) {
          const tr = state.tr.insert(after, paragraph().create());
          tr.setSelection(TextSelection.create(tr.doc, after + 1));
          view.dispatch(tr.scrollIntoView());
          return true;
        }
        const sel = Selection.near(doc.resolve(after), 1);
        view.dispatch(state.tr.setSelection(sel).scrollIntoView());
        return true;
      }

      const before = selection.from;
      if (before <= 0) {
        const tr = state.tr.insert(0, paragraph().create());
        tr.setSelection(TextSelection.create(tr.doc, 1));
        view.dispatch(tr.scrollIntoView());
        return true;
      }
      const sel = Selection.near(doc.resolve(before), -1);
      view.dispatch(state.tr.setSelection(sel).scrollIntoView());
      return true;
    };

    return {
      Enter: () => {
        if (!isImageSelected()) return false;
        const { state, view } = this.editor;
        const after = state.selection.to;
        const tr = state.tr.insert(after, paragraph().create());
        tr.setSelection(TextSelection.create(tr.doc, after + 1));
        view.dispatch(tr.scrollIntoView());
        return true;
      },
      ArrowDown: () => move("down"),
      ArrowRight: () => move("down"),
      ArrowUp: () => move("up"),
      ArrowLeft: () => move("up"),
    };
  },
});
