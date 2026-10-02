// Pure DOM utilities: build a robust selector for an element, capture its
// descriptive info, and (dev only) read the nearest React component + source
// from the fiber. All functions degrade gracefully.
import { ElementInfo, Rect } from "../types";

/** Our own UI is tagged with this attribute so capture logic can ignore it. */
export const UI_ATTR = "data-dev-annotations";

export function isOurUi(el: Element | null): boolean {
  return !!el?.closest?.(`[${UI_ATTR}]`);
}

/** Classes that are too volatile / noisy to help identify an element. */
function stableClasses(el: Element): string[] {
  return Array.from(el.classList)
    .filter((c) => !/^(css-|sc-)/.test(c)) // styled/emotion hashes
    .filter((c) => !/\[|\]|:|\//.test(c)) // tailwind arbitrary/variant classes
    .filter((c) => !/^[a-z0-9]{6,}$/i.test(c) || /[-_]/.test(c)) // opaque hashes
    .slice(0, 4);
}

function nthOfType(el: Element): number {
  let i = 1;
  let sib = el.previousElementSibling;
  while (sib) {
    if (sib.tagName === el.tagName) i++;
    sib = sib.previousElementSibling;
  }
  return i;
}

/** Build a reasonably robust, reasonably short CSS selector for `el`. */
export function buildSelector(el: Element): string {
  if (el.id && document.querySelectorAll(`#${CSS.escape(el.id)}`).length === 1) {
    return `#${CSS.escape(el.id)}`;
  }

  const parts: string[] = [];
  let node: Element | null = el;
  let depth = 0;

  while (node && node.nodeType === 1 && depth < 6) {
    if (node.id && document.querySelectorAll(`#${CSS.escape(node.id)}`).length === 1) {
      parts.unshift(`#${CSS.escape(node.id)}`);
      break;
    }

    const tag = node.tagName.toLowerCase();
    if (tag === "html" || tag === "body") {
      parts.unshift(tag);
      break;
    }

    const cls = stableClasses(node)
      .map((c) => `.${CSS.escape(c)}`)
      .join("");
    let part = `${tag}${cls}`;

    // Disambiguate against siblings with an nth-of-type when needed.
    const parent = node.parentElement;
    if (parent) {
      const sameTag = Array.from(parent.children).filter(
        (c) => c.tagName === node!.tagName
      );
      if (sameTag.length > 1) part += `:nth-of-type(${nthOfType(node)})`;
    }

    parts.unshift(part);
    node = node.parentElement;
    depth++;
  }

  return parts.join(" > ");
}

/** Best-effort repo-relative path from an absolute dev source filename. */
function toRepoPath(fileName: string): string {
  const markers = ["/app/", "/components/", "/lib/", "/hooks/", "/actions/"];
  for (const m of markers) {
    const i = fileName.indexOf(m);
    if (i >= 0) return fileName.slice(i + 1);
  }
  const parts = fileName.split("/");
  return parts.slice(-2).join("/");
}

interface FiberLike {
  type?: unknown;
  return?: FiberLike | null;
  _debugOwner?: FiberLike | null;
  _debugSource?: { fileName: string; lineNumber: number; columnNumber?: number };
}

/** Read nearest React component name + source from the element's fiber (dev). */
export function getReactSource(el: Element): ElementInfo["react"] | undefined {
  const key = Object.keys(el).find(
    (k) =>
      k.startsWith("__reactFiber$") || k.startsWith("__reactInternalInstance$")
  );
  if (!key) return undefined;

  let fiber: FiberLike | null | undefined = (el as unknown as Record<
    string,
    FiberLike
  >)[key];
  let name: string | undefined;
  let source: { file: string; line: number; column?: number } | undefined;
  let depth = 0;

  while (fiber && depth < 40) {
    const t = fiber.type as { displayName?: string; name?: string } | string | undefined;
    if (!name && typeof t === "function") {
      name = (t as { displayName?: string; name?: string }).displayName ||
        (t as { name?: string }).name;
    }
    if (!source && fiber._debugSource) {
      source = {
        file: toRepoPath(fiber._debugSource.fileName),
        line: fiber._debugSource.lineNumber,
        column: fiber._debugSource.columnNumber,
      };
    }
    if (name && source) break;
    fiber = fiber.return ?? fiber._debugOwner ?? null;
    depth++;
  }

  if (!name && !source) return undefined;
  return { name, source };
}

export function docRectOf(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return {
    x: r.left + window.scrollX,
    y: r.top + window.scrollY,
    width: r.width,
    height: r.height,
  };
}

export function getElementInfo(el: Element): ElementInfo {
  const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
  return {
    selector: buildSelector(el),
    tag: el.tagName.toLowerCase(),
    classes: stableClasses(el),
    snippet: text.slice(0, 80),
    rect: docRectOf(el),
    react: getReactSource(el),
  };
}

/** The element under a viewport point, skipping our own UI. */
export function elementAtPoint(x: number, y: number): Element | null {
  const stack = document.elementsFromPoint(x, y);
  for (const el of stack) {
    if (!isOurUi(el)) return el;
  }
  return null;
}

/** Significant elements intersecting a viewport rectangle (for area targets). */
export function elementsInViewportRect(
  left: number,
  top: number,
  width: number,
  height: number
): Element[] {
  const found = new Set<Element>();
  const cols = 4;
  const rows = 4;
  for (let i = 0; i <= cols; i++) {
    for (let j = 0; j <= rows; j++) {
      const x = left + (width * i) / cols;
      const y = top + (height * j) / rows;
      const el = elementAtPoint(x, y);
      if (el && el.tagName !== "BODY" && el.tagName !== "HTML") found.add(el);
    }
  }
  // Drop elements that are ancestors of other found elements (keep the leaves).
  const list = Array.from(found);
  const leaves = list.filter(
    (el) => !list.some((other) => other !== el && el.contains(other))
  );
  return leaves.slice(0, 6);
}
