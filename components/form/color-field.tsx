"use client";

import React, { useEffect, useState } from "react";

import { ControlRow } from "@/components/dashboard/section-card";
import { Input } from "@/components/shadcn/input";
import { cn } from "@/lib/utils";
import FormErrors from "./form-errors";

const HEX = /^#[0-9a-f]{6}$/i;

/**
 * A color setting as one row: label left; a 36px square swatch (opens the
 * native picker) and a hex input right. The swatch is the color itself under
 * a 1px border, so its fill follows the outer corners. Values are stored as
 * the picker gives them (lowercase #rrggbb); the input shows them uppercase.
 */
export default function ColorField({
  id,
  label,
  hint,
  value,
  onChange,
  errors,
}: {
  id: string;
  label: string;
  hint?: React.ReactNode;
  value: string;
  onChange: (hex: string) => void;
  errors?: Record<string, string[] | undefined>;
}) {
  // What is typed; only a complete, valid hex reaches `onChange`.
  const [draft, setDraft] = useState(value.toUpperCase());
  useEffect(() => setDraft(value.toUpperCase()), [value]);

  const typeHex = (text: string) => {
    const next = (text.startsWith("#") ? text : `#${text}`).toUpperCase();
    setDraft(next);
    if (HEX.test(next)) onChange(next.toLowerCase());
  };

  return (
    <div className="space-y-2">
      <ControlRow id={id} label={label} hint={hint}>
        <div className="flex items-center gap-2">
          <label
            className="relative block size-9 shrink-0 cursor-pointer overflow-hidden rounded-md border has-[:focus-visible]:ring-focus has-[:focus-visible]:ring-ring"
            style={{ backgroundColor: value }}
          >
            <span className="sr-only">Pick {label.toLowerCase()}</span>
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="absolute inset-0 size-full cursor-pointer opacity-0"
            />
          </label>
          <Input
            id={id}
            value={draft}
            onChange={(e) => typeHex(e.target.value)}
            onBlur={() => setDraft(value.toUpperCase())}
            maxLength={7}
            spellCheck={false}
            aria-label={`${label} hex`}
            className={cn(
              "h-9 w-24 px-3 uppercase tabular-nums",
              !HEX.test(draft) && "border-destructive"
            )}
          />
        </div>
      </ControlRow>
      <FormErrors id={id} errors={errors} />
    </div>
  );
}
