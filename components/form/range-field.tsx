"use client";

import React, { useRef, useState } from "react";

import { FieldHint } from "@/components/dashboard/section-card";
import FormErrors from "./form-errors";

const decimalsOf = (step: number) => {
  const s = String(step);
  return s.includes(".") ? s.split(".")[1].length : 0;
};

/**
 * The dashboard's numeric slider: a 36px field-like bar that fills from the
 * left up to the value, with a thin handle at the fill's edge, the label
 * inside on the left and the value inside on the right.
 *
 * Pointer: click or drag anywhere. Keyboard: ←/→ one step, Shift+←/→ ten
 * steps, Home/End min/max. Double-click the value to type an exact number
 * (clamped to min/max).
 */
export default function RangeField({
  id,
  label,
  hint,
  value,
  min,
  max,
  step,
  onChange,
  errors,
}: {
  id: string;
  label: string;
  hint?: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  errors?: Record<string, string[] | undefined>;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const decimals = decimalsOf(step);
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const snap = (n: number) =>
    Number(
      (Math.round((clamp(n) - min) / step) * step + min).toFixed(decimals)
    );
  const set = (n: number) => {
    const next = snap(n);
    if (next !== value) onChange(next);
  };

  const fromPointer = (clientX: number) => {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const t = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    set(min + t * (max - min));
  };

  const pct = max > min ? ((clamp(value) - min) / (max - min)) * 100 : 0;

  const commitDraft = () => {
    const n = parseFloat(draft);
    // Typed values are kept as typed (within range), like the number input
    // this replaced; only pointer/keys snap to the step.
    if (Number.isFinite(n)) {
      const next = clamp(n);
      if (next !== value) onChange(next);
    }
    setEditing(false);
  };

  return (
    <div className="space-y-2">
      <div
        ref={barRef}
        id={id}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={value.toFixed(decimals)}
        onPointerDown={(e) => {
          if (editing || e.button !== 0) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          e.currentTarget.focus();
          fromPointer(e.clientX);
        }}
        onPointerMove={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId))
            fromPointer(e.clientX);
        }}
        onKeyDown={(e) => {
          if (editing) return;
          const big = e.shiftKey ? 10 : 1;
          const keys: Record<string, () => number> = {
            ArrowRight: () => value + step * big,
            ArrowUp: () => value + step * big,
            ArrowLeft: () => value - step * big,
            ArrowDown: () => value - step * big,
            Home: () => min,
            End: () => max,
          };
          const to = keys[e.key];
          if (!to) return;
          e.preventDefault();
          set(to());
        }}
        className="relative flex h-9 cursor-ew-resize touch-none select-none items-center overflow-hidden rounded-md border bg-muted outline-none focus-visible:ring-focus focus-visible:ring-ring"
      >
        {/* 10% ticks */}
        {Array.from({ length: 9 }, (_, i) => (
          <span
            key={i}
            aria-hidden
            className="absolute inset-y-2.5 w-px bg-input"
            style={{ left: `${(i + 1) * 10}%` }}
          />
        ))}
        {/* Fill up to the value, handle on its edge */}
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 bg-secondary"
          style={{ width: `${pct}%` }}
        />
        <span
          aria-hidden
          className="absolute top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-foreground"
          style={{ left: `clamp(0px, calc(${pct}% - 1px), calc(100% - 2px))` }}
        />

        <span className="pointer-events-none relative z-10 pl-3 text-sm text-foreground">
          {label}
        </span>
        {editing ? (
          <input
            autoFocus
            inputMode="decimal"
            value={draft}
            aria-label={`${label} value`}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitDraft}
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") {
                // Don't let Enter submit the surrounding form.
                e.preventDefault();
                commitDraft();
              }
              if (e.key === "Escape") setEditing(false);
            }}
            className="relative z-10 ml-auto mr-1.5 h-7 w-20 rounded-sm border border-input bg-background px-2 text-right text-sm tabular-nums outline-none"
          />
        ) : (
          <span
            // The value is for reading / double-click editing, not a click
            // target for setting the value.
            onPointerDown={(e) => e.stopPropagation()}
            onDoubleClick={() => {
              setDraft(value.toFixed(decimals));
              setEditing(true);
            }}
            title="Double-click to type a value"
            className="relative z-10 ml-auto cursor-text pr-3 text-sm tabular-nums text-foreground"
          >
            {value.toFixed(decimals)}
          </span>
        )}
      </div>
      {hint && <FieldHint>{hint}</FieldHint>}
      <FormErrors id={id} errors={errors} />
    </div>
  );
}
