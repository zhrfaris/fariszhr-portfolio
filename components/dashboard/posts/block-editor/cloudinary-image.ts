import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";

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
});
