"use client";

import React from "react";

import { TooltipProvider } from "@/components/shadcn/tooltip";
import { cn } from "@/lib/utils";

export type SimpleColumn<T> = {
  header: string;
  cell: (row: T) => React.ReactNode;
  /** Extra classes for this column's cells (e.g. muted text). */
  className?: string;
};

/**
 * The dashboard's short-list table (Workplaces, Categories): plain header
 * labels, no sorting / filtering / selection / paging, text that wraps,
 * top-aligned rows with 12px vertical padding, dividers between rows only.
 * `columns` maps to CSS grid tracks in `template`.
 *
 * The header and every row are separate grids sharing `template`, so it must
 * not contain content-sized tracks (`auto`, `min-content`): give fixed widths
 * (e.g. the Actions column) and `minmax(0, …fr)` for the rest, and each
 * header lines up exactly with its cells.
 */
export function SimpleTable<T>({
  label,
  columns,
  rows,
  rowKey,
  template,
}: {
  label: string;
  columns: SimpleColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** grid-template-columns, one track per column; fixed or minmax(0, fr)
   * tracks only (see above). */
  template: string;
}) {
  const grid = "grid gap-x-3 px-2";
  return (
    <TooltipProvider delayDuration={200}>
      <div role="table" aria-label={label} className="-mx-2">
        <div role="rowgroup">
          <div
            role="row"
            className={cn(
              grid,
              "h-10 items-center text-[13px] font-medium text-muted-foreground"
            )}
            style={{ gridTemplateColumns: template }}
          >
            {columns.map((c) => (
              <span key={c.header} role="columnheader">
                {c.header}
              </span>
            ))}
          </div>
        </div>
        <div role="rowgroup">
          {rows.map((row) => (
            <div
              key={rowKey(row)}
              role="row"
              className={cn(
                grid,
                "items-start border-b py-3 text-sm last:border-b-0 hover:bg-muted"
              )}
              style={{ gridTemplateColumns: template }}
            >
              {columns.map((c) => (
                <div
                  key={c.header}
                  role="cell"
                  className={cn(
                    "flex min-h-8 min-w-0 items-center break-words",
                    c.className
                  )}
                >
                  {c.cell(row)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
