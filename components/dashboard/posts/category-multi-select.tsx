"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import { Label } from "@/components/shadcn/label";
import { cn } from "@/lib/utils";
import { CategoryOption } from "./use-categories";

interface CategoryMultiSelectProps {
  options: CategoryOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onCreate: (name: string) => Promise<CategoryOption | null>;
  busy?: boolean;
}

/**
 * Chip-based category multi-select (design 2): selected categories render as
 * removable chips; typing filters the options and, with no exact match,
 * creates a new category on Enter. Deleting categories lives on the
 * Categories page only.
 */
export default function CategoryMultiSelect({
  options,
  selectedIds,
  onChange,
  onCreate,
  busy,
}: CategoryMultiSelectProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const selected = selectedIds
    .map((id) => options.find((o) => o.id === id))
    .filter(Boolean) as CategoryOption[];

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = options.filter(
    (o) =>
      !selectedIds.includes(o.id) &&
      o.name.toLowerCase().includes(normalizedQuery)
  );
  const exactExists = options.some(
    (o) => o.name.toLowerCase() === normalizedQuery
  );

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
    );
    setQuery("");
    inputRef.current?.focus();
  };

  const create = async () => {
    if (!normalizedQuery || busy) return;
    const opt = await onCreate(query);
    if (opt) {
      onChange([...selectedIds, opt.id]);
      setQuery("");
      inputRef.current?.focus();
    }
  };

  return (
    <div className="space-y-2" ref={wrapRef}>
      <Label className="text-sm font-semibold text-foreground/80">
        Category
      </Label>
      <div
        className={cn(
          "rounded-lg border border-input bg-background",
          open && "ring-1 ring-ring"
        )}
      >
        <div
          className="flex flex-wrap items-center gap-2 p-2"
          onClick={() => {
            setOpen(true);
            inputRef.current?.focus();
          }}
        >
          {selected.map((opt) => (
            <span
              key={opt.id}
              className="inline-flex items-center gap-1 rounded-md border bg-muted px-2 py-1 text-sm"
            >
              {opt.name}
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(opt.id);
                }}
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (!exactExists && normalizedQuery) {
                  void create();
                } else if (filtered.length === 1) {
                  toggle(filtered[0].id);
                }
              } else if (
                e.key === "Backspace" &&
                !query &&
                selected.length > 0
              ) {
                toggle(selected[selected.length - 1].id);
              }
            }}
            placeholder={selected.length ? "" : "Select or type to create…"}
            className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-sm outline-none"
          />
        </div>

        {open && (
          <div className="border-t p-3">
            <p className="mb-2 text-xs text-muted-foreground">
              Select available option or type to create one
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {normalizedQuery && !exactExists && (
                <button
                  type="button"
                  onClick={() => void create()}
                  disabled={busy}
                  className="inline-flex items-center gap-1 rounded-md border border-dashed px-2 py-1 text-sm hover:bg-muted disabled:opacity-50"
                >
                  Create &quot;{query.trim()}&quot;
                </button>
              )}
              {filtered.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className="inline-flex items-center rounded-full border bg-background px-2 py-0.5 text-xs hover:bg-muted"
                  onClick={() => toggle(opt.id)}
                >
                  {opt.name}
                </button>
              ))}
              {filtered.length === 0 && !normalizedQuery && (
                <span className="text-sm text-muted-foreground">
                  No categories yet — type to create one.
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
