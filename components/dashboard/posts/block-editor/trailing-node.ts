import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Node as ProseMirrorNode } from "@tiptap/pm/model";

interface TrailingNodeOptions {
  node: string;
  notAfter: string[];
}

/**
 * Ensures the document always ends with an empty paragraph, so there is always a
 * line to type on after an image or any other non-text block (Notion / Lark
 * behaviour). After a drop it also collapses consecutive trailing empty
 * paragraphs to exactly one (dropping a block below the last line can leave two).
 * Trailing empties are stripped again on save.
 */
export const TrailingNode = Extension.create<TrailingNodeOptions>({
  name: "trailingNode",

  addOptions() {
    return {
      node: "paragraph",
      notAfter: ["paragraph"],
    };
  },

  addProseMirrorPlugins() {
    const pluginKey = new PluginKey(this.name);
    const nodeName = this.options.node;
    const notAfter = this.options.notAfter;

    return [
      new Plugin({
        key: pluginKey,
        appendTransaction: (transactions, _oldState, state) => {
          const paragraphType = state.schema.nodes[nodeName];
          if (!paragraphType) return;

          const isEmptyParagraph = (node?: ProseMirrorNode | null) =>
            !!node && node.type === paragraphType && node.content.size === 0;

          const tr = state.tr;
          let modified = false;

          // After a drop, collapse consecutive trailing empty paragraphs to one.
          const isDrop = transactions.some(
            (t) => t.getMeta("uiEvent") === "drop"
          );
          if (isDrop) {
            while (
              tr.doc.childCount >= 2 &&
              isEmptyParagraph(tr.doc.lastChild) &&
              isEmptyParagraph(tr.doc.child(tr.doc.childCount - 2))
            ) {
              const last = tr.doc.lastChild as ProseMirrorNode;
              tr.delete(
                tr.doc.content.size - last.nodeSize,
                tr.doc.content.size
              );
              modified = true;
            }
          }

          // Ensure the document ends with a paragraph.
          const last = tr.doc.lastChild;
          if (last && !notAfter.includes(last.type.name)) {
            tr.insert(tr.doc.content.size, paragraphType.create());
            modified = true;
          }

          return modified ? tr : undefined;
        },
      }),
    ];
  },
});
