/**
 * Shared types for the dev-only annotation tool. Used by both the client UI and
 * the dev API routes. This whole feature is development-only and must never be
 * rendered or served in production.
 */

export type AnnotationStatus =
  | "open"
  | "needs-reply"
  | "pending-review"
  | "resolved";

export type ThreadAuthor = "user" | "claude";
export type ThreadKind = "comment" | "resolution" | "question";

export interface ThreadMessage {
  id: string;
  author: ThreadAuthor;
  kind: ThreadKind;
  text: string;
  createdAt: string;
}

export interface ElementInfo {
  /** A reasonably robust CSS selector resolving back to this element. */
  selector: string;
  tag: string;
  /** A few stable class names (filtered of hashed/utility noise where sensible). */
  classes: string[];
  /** Short visible-text snippet for human context. */
  snippet: string;
  /** Bounding box in document coordinates at capture time. */
  rect: Rect;
  /** Nearest React component name + source (dev fibers only; may be absent). */
  react?: {
    name?: string;
    source?: { file: string; line: number; column?: number };
  };
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AnnotationTarget {
  type: "element" | "area";
  /** For element targets: the clicked element. */
  element?: ElementInfo;
  /** For area targets: the drawn rectangle (document coords) + main elements. */
  area?: {
    rect: Rect;
    elements: ElementInfo[];
  };
}

export interface Annotation {
  id: string;
  number: number;
  createdAt: string;
  updatedAt: string;
  status: AnnotationStatus;
  page: {
    path: string;
    viewport: { width: number; height: number };
  };
  target: AnnotationTarget;
  thread: ThreadMessage[];
}

/** Structured per-annotation result Claude writes to .annotations/run-report.json */
export interface RunReportItem {
  id: string;
  status: "fixed" | "question";
  /** resolution note when fixed */
  note?: string;
  /** question text when it needs clarification */
  question?: string;
}

export type RunPhase =
  | "idle"
  | "running"
  | "awaiting-review"
  | "failed";

export interface RunState {
  phase: RunPhase;
  runId: string | null;
  branch: string | null;
  /** HEAD sha at snapshot time. */
  preRunHead: string | null;
  /** commit-tree sha capturing the full pre-run working tree (no branch commit). */
  snapshotCommit: string | null;
  /** Annotation ids included in the current/last run. */
  annotationIds: string[];
  startedAt: string | null;
  finishedAt: string | null;
  error?: string | null;
}

/** SSE event shapes streamed to the panel during a run. */
export type RunEvent =
  | { type: "status"; message: string }
  | { type: "tool"; tool: string; detail?: string }
  | { type: "assistant"; text: string }
  | { type: "done"; ok: true }
  | { type: "error"; message: string };
