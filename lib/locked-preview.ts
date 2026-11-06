import type { Portfolio } from "@/actions/post/get/types";

/*
 * Server-side trimming of a restricted case study's Content for the locked
 * preview. Only what this returns is sent to the browser, so the rest of the
 * Content never leaves the server until the password is entered.
 *
 * Rules: keep top-level blocks in order and stop
 *   - before the first image (inline <img> or a legacy content image),
 *   - after MAX_TEXT_BLOCKS text blocks,
 *   - once about MAX_WORDS words are reached (a long paragraph is cut short).
 * That's comfortably more than the 360–400px preview box shows.
 */

const MAX_TEXT_BLOCKS = 5;
const MAX_WORDS = 120;

const VOID_TAGS = new Set(["img", "hr", "br", "input", "source", "wbr"]);

type Sections = NonNullable<Portfolio>["post_sections"];

/** Split editor HTML into its top-level blocks (no DOM, so it runs on the server). */
function topLevelBlocks(html: string): string[] {
  const blocks: string[] = [];
  const tagRe = /<\/?([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*?>/g;
  let depth = 0;
  let start = -1;
  let m: RegExpExecArray | null;

  while ((m = tagRe.exec(html)) !== null) {
    const tag = m[0];
    const name = m[1].toLowerCase();
    const closing = tag.startsWith("</");
    const selfClosing = VOID_TAGS.has(name) || tag.endsWith("/>");

    if (depth === 0 && !closing) start = m.index;

    if (closing) depth = Math.max(depth - 1, 0);
    else if (!selfClosing) depth += 1;

    if (depth === 0 && start !== -1) {
      blocks.push(html.slice(start, tagRe.lastIndex));
      start = -1;
    }
  }
  return blocks;
}

const textOf = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const wordCount = (text: string) => (text ? text.split(" ").length : 0);

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function buildLockedPreview(sections: Sections): Sections {
  const out: Sections = [];
  let textBlocks = 0;
  let words = 0;
  const full = () => textBlocks >= MAX_TEXT_BLOCKS || words >= MAX_WORDS;

  for (const section of sections) {
    if (full()) break;

    const title = section.title?.trim() ?? "";
    if (title) {
      textBlocks += 1;
      words += wordCount(title);
    }

    const contents: typeof section.contents = [];
    let hitImage = false;

    for (const content of section.contents) {
      if (full()) break;

      const kept: string[] = [];
      for (const block of topLevelBlocks(content.content ?? "")) {
        if (/<img\b/i.test(block)) {
          hitImage = true;
          break;
        }
        const text = textOf(block);
        if (!text) {
          // Divider or empty paragraph: keep for layout, doesn't count.
          kept.push(block);
          continue;
        }
        const n = wordCount(text);
        if (words + n > MAX_WORDS + 20) {
          // Long block: keep only the words that fit, as plain text.
          const room = Math.max(MAX_WORDS - words, 20);
          kept.push(`<p>${escapeHtml(text.split(" ").slice(0, room).join(" "))}…</p>`);
          words = MAX_WORDS;
          textBlocks += 1;
          break;
        }
        kept.push(block);
        words += n;
        textBlocks += 1;
        if (full()) break;
      }

      if (kept.length) {
        // Drop the legacy image field: images are never part of the preview.
        contents.push({ ...content, content: kept.join(""), image: null });
      }
      if (hitImage || content.image) {
        hitImage = true;
        break;
      }
    }

    if (title || contents.length) out.push({ ...section, contents });
    if (hitImage) break;
  }

  return out;
}
