"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Annotation, AnnotationTarget, RunEvent, RunState } from "./types";
import * as api from "./lib/api";
import {
  elementAtPoint,
  elementsInViewportRect,
  getElementInfo,
  isOurUi,
} from "./lib/selector";
import { Panel, Thread } from "./panel";

const PANEL_W = 288;

interface Draft {
  target: AnnotationTarget;
  anchor: { left: number; top: number };
}

function isTypingTarget(el: EventTarget | null): boolean {
  const t = el as HTMLElement | null;
  if (!t || !t.tagName) return false;
  const tag = t.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    t.isContentEditable ||
    !!t.closest?.(".ProseMirror")
  );
}

export default function DevAnnotations() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const [panelOpen, setPanelOpen] = useState(false);
  const [capture, setCapture] = useState(false);

  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [runState, setRunState] = useState<RunState | null>(null);
  const [running, setRunning] = useState(false);
  const [runEvents, setRunEvents] = useState<RunEvent[]>([]);

  const [hover, setHover] = useState<DOMRect | null>(null);
  const [drag, setDrag] = useState<{
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  } | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [draftText, setDraftText] = useState("");
  const [openThreadId, setOpenThreadId] = useState<string | null>(null);
  const [showResolved, setShowResolved] = useState(false);
  const [, setTick] = useState(0);
  const [highlight, setHighlight] = useState<DOMRect | null>(null);

  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const esRef = useRef<EventSource | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [a, s] = await Promise.all([
        api.fetchAnnotations(),
        api.fetchState(),
      ]);
      setAnnotations(a);
      setRunState(s);
      return s;
    } catch {
      return null;
    }
  }, []);

  const openStream = useCallback(
    (runId: string) => {
      esRef.current?.close();
      setRunning(true);
      const es = new EventSource(
        `/api/dev-annotations/run/events?runId=${runId}`
      );
      esRef.current = es;
      es.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data) as RunEvent;
          setRunEvents((prev) => [...prev, data]);
          if (data.type === "done" || data.type === "error") {
            es.close();
            setRunning(false);
            void refresh();
          }
        } catch {
          // ignore malformed frame
        }
      };
      es.onerror = () => {
        es.close();
        setRunning(false);
        void refresh();
      };
    },
    [refresh]
  );

  // Mount: load data and reconnect to an in-progress run if any.
  useEffect(() => {
    setMounted(true);
    void refresh().then((s) => {
      if (s?.phase === "running" && s.runId) openStream(s.runId);
    });
    return () => esRef.current?.close();
  }, [refresh, openStream]);

  const toggleCapture = useCallback(() => {
    setCapture((c) => {
      const next = !c;
      if (next) setPanelOpen(true);
      else {
        setDraft(null);
        setHover(null);
      }
      return next;
    });
  }, []);

  // Alt+A shortcut (ignored while typing in inputs or the editor).
  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "a" || e.key === "A")) {
        if (isTypingTarget(e.target)) return;
        e.preventDefault();
        toggleCapture();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mounted, toggleCapture]);

  // Re-anchor pins on scroll / resize.
  useEffect(() => {
    if (!mounted) return;
    let raf = 0;
    const onMove = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setTick((t) => t + 1));
    };
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
      cancelAnimationFrame(raf);
    };
  }, [mounted]);

  // Capture mode: intercept hover / click / drag over the page.
  useEffect(() => {
    if (!capture) return;

    const onPointerMove = (e: PointerEvent) => {
      if (dragStartRef.current) {
        setDrag({
          x0: dragStartRef.current.x,
          y0: dragStartRef.current.y,
          x1: e.clientX,
          y1: e.clientY,
        });
        setHover(null);
        return;
      }
      const el = elementAtPoint(e.clientX, e.clientY);
      setHover(el ? el.getBoundingClientRect() : null);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 || isOurUi(e.target as Element)) return;
      e.preventDefault();
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const start = dragStartRef.current;
      dragStartRef.current = null;
      setDrag(null);
      setHover(null);
      if (!start || isOurUi(e.target as Element)) return;

      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
        const el = elementAtPoint(e.clientX, e.clientY);
        if (!el) return;
        setDraft({
          target: { type: "element", element: getElementInfo(el) },
          anchor: { left: e.clientX, top: e.clientY },
        });
      } else {
        const left = Math.min(start.x, e.clientX);
        const top = Math.min(start.y, e.clientY);
        const width = Math.abs(dx);
        const height = Math.abs(dy);
        const els = elementsInViewportRect(left, top, width, height).map(
          getElementInfo
        );
        setDraft({
          target: {
            type: "area",
            area: {
              rect: {
                x: left + window.scrollX,
                y: top + window.scrollY,
                width,
                height,
              },
              elements: els,
            },
          },
          anchor: { left: left + width, top },
        });
      }
      setDraftText("");
    };

    const onClickCapture = (e: MouseEvent) => {
      if (isOurUi(e.target as Element)) return;
      e.preventDefault();
      e.stopPropagation();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDraft(null);
        dragStartRef.current = null;
        setDrag(null);
      }
    };

    window.addEventListener("pointermove", onPointerMove, true);
    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("pointerup", onPointerUp, true);
    window.addEventListener("click", onClickCapture, true);
    window.addEventListener("keydown", onKey, true);
    document.body.style.cursor = "crosshair";

    return () => {
      window.removeEventListener("pointermove", onPointerMove, true);
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("pointerup", onPointerUp, true);
      window.removeEventListener("click", onClickCapture, true);
      window.removeEventListener("keydown", onKey, true);
      document.body.style.cursor = "";
    };
  }, [capture]);

  const saveDraft = async () => {
    if (!draft) return;
    const text = draftText.trim();
    if (!text) return;
    await api.createAnnotation({
      page: {
        path: pathname,
        viewport: { width: window.innerWidth, height: window.innerHeight },
      },
      target: draft.target,
      text,
    });
    setDraft(null);
    setDraftText("");
    void refresh();
  };

  const flashHighlight = (rect: DOMRect) => {
    setHighlight(rect);
    window.setTimeout(() => setHighlight(null), 1400);
  };

  const scrollToAnnotation = (a: Annotation) => {
    const sel = a.target.element?.selector;
    const el = sel ? document.querySelector(sel) : null;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => flashHighlight(el.getBoundingClientRect()), 350);
    } else if (a.target.area) {
      window.scrollTo({
        top: Math.max(0, a.target.area.rect.y - 120),
        behavior: "smooth",
      });
    }
    setOpenThreadId(a.id);
  };

  const onSend = async () => {
    try {
      setRunEvents([]);
      const { runId } = await api.startRun();
      await refresh();
      openStream(runId);
    } catch (e) {
      setRunEvents((prev) => [
        ...prev,
        { type: "error", message: String(e) },
      ]);
    }
  };

  const onReview = async (action: "simpan" | "batalkan") => {
    try {
      await api.review(action);
      setRunEvents([]);
      void refresh();
    } catch (e) {
      alert(String(e));
    }
  };

  if (!mounted) return null;

  const pagePins = annotations.filter(
    (a) =>
      a.page.path === pathname &&
      (showResolved || a.status !== "resolved")
  );

  const livePin = (a: Annotation): { left: number; top: number } | null => {
    const sel = a.target.element?.selector;
    if (sel) {
      const el = document.querySelector(sel);
      if (el) {
        const r = el.getBoundingClientRect();
        return { left: r.left, top: r.top };
      }
      if (a.target.element) {
        return {
          left: a.target.element.rect.x - window.scrollX,
          top: a.target.element.rect.y - window.scrollY,
        };
      }
    }
    if (a.target.area) {
      return {
        left: a.target.area.rect.x - window.scrollX,
        top: a.target.area.rect.y - window.scrollY,
      };
    }
    return null;
  };

  const liveAreaRect = (a: Annotation): DOMRect | null => {
    if (!a.target.area) return null;
    const r = a.target.area.rect;
    return new DOMRect(
      r.x - window.scrollX,
      r.y - window.scrollY,
      r.width,
      r.height
    );
  };

  const openThread = openThreadId
    ? annotations.find((a) => a.id === openThreadId) ?? null
    : null;
  const threadPin = openThread ? livePin(openThread) : null;

  const clamp = (left: number, top: number) => ({
    left: Math.max(8, Math.min(left, window.innerWidth - PANEL_W - 8)),
    top: Math.max(8, Math.min(top, window.innerHeight - 240)),
  });

  const openCount = annotations.filter((a) => a.status === "open").length;

  return (
    <div data-dev-annotations="">{/* UI_ATTR marker for capture logic */}
      {/* Floating toggle */}
      <button
        onClick={() => {
          if (panelOpen) {
            setPanelOpen(false);
            setCapture(false);
          } else {
            setPanelOpen(true);
            setCapture(true);
          }
        }}
        className="fixed bottom-16 right-4 z-[999999] flex size-11 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg hover:bg-neutral-800"
        title="Annotations (Alt+A)"
        aria-label="Toggle annotations"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Banner */}
      {capture && (
        <div className="pointer-events-none fixed left-1/2 top-4 z-[999999] -translate-x-1/2 rounded-full bg-neutral-900/90 px-4 py-1.5 text-xs font-medium text-white shadow-lg">
          Annotation mode — click an element or drag to select an area · Esc to
          cancel
        </div>
      )}

      {/* Overlay: hover outline, drag rect, pins, area outlines, highlight */}
      <div className="pointer-events-none fixed inset-0 z-[999990] overflow-hidden">
        {capture && hover && (
          <div
            className="absolute border-2 border-blue-500/80 bg-blue-500/10"
            style={{
              left: hover.left,
              top: hover.top,
              width: hover.width,
              height: hover.height,
            }}
          />
        )}

        {drag && (
          <div
            className="absolute border-2 border-blue-600 bg-blue-500/10"
            style={{
              left: Math.min(drag.x0, drag.x1),
              top: Math.min(drag.y0, drag.y1),
              width: Math.abs(drag.x1 - drag.x0),
              height: Math.abs(drag.y1 - drag.y0),
            }}
          />
        )}

        {highlight && (
          <div
            className="absolute rounded ring-4 ring-amber-400/80 transition-opacity"
            style={{
              left: highlight.left,
              top: highlight.top,
              width: highlight.width,
              height: highlight.height,
            }}
          />
        )}

        {pagePins.map((a) => {
          const pos = livePin(a);
          if (!pos) return null;
          const areaRect = liveAreaRect(a);
          return (
            <div key={a.id}>
              {areaRect && (
                <div
                  className="absolute border border-dashed border-blue-500/70"
                  style={{
                    left: areaRect.left,
                    top: areaRect.top,
                    width: areaRect.width,
                    height: areaRect.height,
                  }}
                />
              )}
              <button
                onClick={() => setOpenThreadId(a.id)}
                className="pointer-events-auto absolute flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full rounded-bl-none bg-blue-600 text-[11px] font-bold text-white shadow-md ring-2 ring-white hover:bg-blue-700"
                style={{ left: pos.left, top: pos.top }}
                title={`Annotation #${a.number}`}
              >
                {a.number}
              </button>
            </div>
          );
        })}
      </div>

      {/* Draft popover */}
      {draft && (
        <div
          className="fixed z-[999999] w-72 rounded-lg border border-neutral-200 bg-white p-2 shadow-2xl"
          style={clamp(draft.anchor.left, draft.anchor.top)}
        >
          <p className="mb-1 text-[11px] text-neutral-500">
            {draft.target.type === "area"
              ? `Area · ${draft.target.area?.elements.length ?? 0} element(s)`
              : draft.target.element?.selector}
          </p>
          <textarea
            autoFocus
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void saveDraft();
              if (e.key === "Escape") setDraft(null);
            }}
            rows={3}
            placeholder="Describe the issue…"
            className="w-full resize-none rounded-md border border-neutral-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500"
          />
          <div className="mt-1.5 flex justify-end gap-2">
            <button
              onClick={() => setDraft(null)}
              className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              onClick={() => void saveDraft()}
              className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Thread popover */}
      {openThread && threadPin && (
        <div
          className="fixed z-[999999] w-72 rounded-lg border border-neutral-200 bg-white p-2.5 shadow-2xl"
          style={clamp(threadPin.left + 16, threadPin.top)}
        >
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-semibold">
              Annotation #{openThread.number}
            </span>
            <button
              onClick={() => setOpenThreadId(null)}
              className="text-neutral-400 hover:text-neutral-700"
              aria-label="Close thread"
            >
              ✕
            </button>
          </div>
          <Thread
            annotation={openThread}
            onReply={async (text) => {
              await api.replyAnnotation(openThread.id, text);
              void refresh();
            }}
            onResolveToggle={async () => {
              await api.setAnnotationStatus(
                openThread.id,
                openThread.status === "resolved" ? "open" : "resolved"
              );
              void refresh();
            }}
            onDelete={async () => {
              await api.deleteAnnotation(openThread.id);
              setOpenThreadId(null);
              void refresh();
            }}
          />
        </div>
      )}

      {/* Side panel */}
      {panelOpen && (
        <Panel
          pagePath={pathname}
          annotations={annotations.filter((a) => a.page.path === pathname)}
          openCount={openCount}
          showResolved={showResolved}
          onToggleResolved={() => setShowResolved((s) => !s)}
          runState={runState}
          running={running}
          runEvents={runEvents}
          onSend={onSend}
          onReview={onReview}
          onItemClick={scrollToAnnotation}
          onClose={() => {
            setPanelOpen(false);
            setCapture(false);
            setDraft(null);
            setOpenThreadId(null);
          }}
          captureOn={capture}
          onToggleCapture={toggleCapture}
        />
      )}
    </div>
  );
}
