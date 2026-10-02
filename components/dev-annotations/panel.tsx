"use client";

import { useState } from "react";
import { Annotation, AnnotationStatus, RunEvent, RunState } from "./types";

const STATUS_META: Record<
  AnnotationStatus,
  { label: string; bg: string; fg: string }
> = {
  open: { label: "Open", bg: "#dbeafe", fg: "#1d4ed8" },
  "needs-reply": { label: "Needs reply", bg: "#fef3c7", fg: "#b45309" },
  "pending-review": { label: "Pending review", bg: "#ede9fe", fg: "#6d28d9" },
  resolved: { label: "Resolved", bg: "#dcfce7", fg: "#15803d" },
};

export function StatusBadge({ status }: { status: AnnotationStatus }) {
  const m = STATUS_META[status];
  return (
    <span
      style={{ background: m.bg, color: m.fg }}
      className="rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none"
    >
      {m.label}
    </span>
  );
}

export function Thread({
  annotation,
  onReply,
  onResolveToggle,
  onDelete,
}: {
  annotation: Annotation;
  onReply: (text: string) => void;
  onResolveToggle: () => void;
  onDelete: () => void;
}) {
  const [text, setText] = useState("");
  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onReply(t);
    setText("");
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex max-h-56 flex-col gap-2 overflow-auto pr-1">
        {annotation.thread.map((m) => (
          <div key={m.id} className="text-xs">
            <div className="mb-0.5 flex items-center gap-1.5">
              <span
                className="font-semibold"
                style={{ color: m.author === "claude" ? "#7c3aed" : "#111827" }}
              >
                {m.author === "claude" ? "Claude" : "You"}
              </span>
              {m.kind === "question" && (
                <span className="text-[10px] text-amber-600">question</span>
              )}
              {m.kind === "resolution" && (
                <span className="text-[10px] text-violet-600">fix</span>
              )}
            </div>
            <p className="whitespace-pre-wrap text-neutral-700">{m.text}</p>
          </div>
        ))}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
        }}
        rows={2}
        placeholder={
          annotation.status === "needs-reply"
            ? "Answer Claude… (reopens for the next run)"
            : "Reply…"
        }
        className="w-full resize-none rounded-md border border-neutral-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500"
      />
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={submit}
            className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700"
          >
            Reply
          </button>
          <button
            onClick={onResolveToggle}
            className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
          >
            {annotation.status === "resolved" ? "Reopen" : "Resolve"}
          </button>
        </div>
        <button
          onClick={onDelete}
          className="text-xs text-neutral-400 hover:text-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function RunProgress({ events }: { events: RunEvent[] }) {
  if (events.length === 0) return null;
  return (
    <div className="mt-2 max-h-40 overflow-auto rounded-md bg-neutral-900 p-2 font-mono text-[11px] leading-relaxed text-neutral-200">
      {events.map((e, i) => {
        let line = "";
        if (e.type === "status") line = e.message;
        else if (e.type === "tool")
          line = `${e.tool}${e.detail ? ` · ${e.detail}` : ""}`;
        else if (e.type === "assistant") line = `“${e.text}”`;
        else if (e.type === "done") line = "✓ done";
        else if (e.type === "error") line = `✗ ${e.message}`;
        return (
          <div
            key={i}
            className={
              e.type === "error"
                ? "text-red-400"
                : e.type === "done"
                  ? "text-green-400"
                  : e.type === "tool"
                    ? "text-sky-300"
                    : ""
            }
          >
            {line}
          </div>
        );
      })}
    </div>
  );
}

export function Panel({
  pagePath,
  annotations,
  openCount,
  showResolved,
  onToggleResolved,
  runState,
  running,
  runEvents,
  onSend,
  onReview,
  onItemClick,
  onClose,
  captureOn,
  onToggleCapture,
}: {
  pagePath: string;
  annotations: Annotation[];
  openCount: number;
  showResolved: boolean;
  onToggleResolved: () => void;
  runState: RunState | null;
  running: boolean;
  runEvents: RunEvent[];
  onSend: () => void;
  onReview: (action: "simpan" | "batalkan") => void;
  onItemClick: (a: Annotation) => void;
  onClose: () => void;
  captureOn: boolean;
  onToggleCapture: () => void;
}) {
  const visible = annotations
    .filter((a) => (showResolved ? true : a.status !== "resolved"))
    .sort((a, b) => {
      const order: AnnotationStatus[] = [
        "needs-reply",
        "open",
        "pending-review",
        "resolved",
      ];
      const d = order.indexOf(a.status) - order.indexOf(b.status);
      return d !== 0 ? d : a.number - b.number;
    });

  const awaitingReview = runState?.phase === "awaiting-review";

  return (
    <div
      className="fixed right-4 top-4 z-[999998] flex max-h-[calc(100vh-2rem)] w-80 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white text-neutral-900 shadow-2xl"
      style={{ fontFeatureSettings: '"tnum"' }}
    >
      <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Annotations</span>
          <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-500">
            dev
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-700"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 border-b border-neutral-200 px-3 py-2">
        <button
          onClick={onToggleCapture}
          className={`rounded-md px-2.5 py-1 text-xs font-medium ${
            captureOn
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
          }`}
        >
          {captureOn ? "Annotating… (Alt+A)" : "Annotate (Alt+A)"}
        </button>
        <label className="flex items-center gap-1 text-xs text-neutral-500">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={onToggleResolved}
          />
          Resolved
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {visible.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-neutral-400">
            No annotations on this page yet.
            <br />
            Click “Annotate”, then click an element or drag an area.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {visible.map((a) => (
              <li key={a.id}>
                <button
                  onClick={() => onItemClick(a)}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-neutral-50"
                >
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                    {a.number}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="mb-0.5 flex items-center gap-1.5">
                      <StatusBadge status={a.status} />
                    </span>
                    <span className="block truncate text-xs text-neutral-700">
                      {a.thread[0]?.text || a.target.element?.snippet || "—"}
                    </span>
                    <span className="block truncate text-[10px] text-neutral-400">
                      {a.target.type === "area"
                        ? "area selection"
                        : a.target.element?.selector}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-neutral-200 p-3">
        {awaitingReview ? (
          <div className="space-y-2">
            <p className="text-xs text-neutral-600">
              Review the changes from the last run.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => onReview("simpan")}
                className="flex-1 rounded-md bg-green-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
              >
                Simpan
              </button>
              <button
                onClick={() => onReview("batalkan")}
                className="flex-1 rounded-md border border-neutral-300 px-2.5 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Batalkan
              </button>
            </div>
            {runState?.error && (
              <p className="text-[11px] text-red-600">{runState.error}</p>
            )}
          </div>
        ) : (
          <button
            onClick={onSend}
            disabled={running || openCount === 0}
            className="w-full rounded-md bg-neutral-900 px-2.5 py-1.5 text-xs font-semibold text-white enabled:hover:bg-neutral-800 disabled:opacity-40"
          >
            {running
              ? "Claude is working…"
              : `Kirim ke Claude (${openCount} open)`}
          </button>
        )}

        {running && (
          <p className="mt-2 text-[11px] text-amber-600">
            Don’t use the terminal Claude Code session while this runs.
          </p>
        )}

        <RunProgress events={runEvents} />

        <p className="mt-2 text-[10px] text-neutral-400">
          Page: {pagePath}
        </p>
      </div>
    </div>
  );
}
