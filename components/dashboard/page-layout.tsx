import React from "react";

import { cn } from "@/lib/utils";

/*
 * Dashboard page layout, shared by every page: a #F5F5F7 page, a centered
 * 760px column of section cards, and (for forms) a sticky action bar along
 * the bottom of the main area with its buttons on the column's right edge.
 *
 * A form page renders <form className={PAGE_SHELL}> itself so the bar's
 * submit button sits inside the form; other pages use <PageShell>.
 */

/** Root of a dashboard page (also usable as a <form>'s className). */
export const PAGE_SHELL = "flex flex-1 flex-col bg-muted";

/** 760px content + 32px side padding (16px on phones). */
const COLUMN = "mx-auto w-full max-w-[824px] px-4 sm:px-8";

export function PageShell({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn(PAGE_SHELL, className)}>{children}</div>;
}

/** The column of cards: 32px top, 20px between cards. */
export function PageColumn({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(COLUMN, "flex flex-1 flex-col gap-5 pb-8 pt-8", className)}
    >
      {children}
    </div>
  );
}

/**
 * Sticky bottom bar: full width of the main area, buttons right-aligned to
 * the column. It is the last thing in the flow, so it never covers the last
 * card.
 */
export function StickyActionBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 border-t bg-background">
      <div className={cn(COLUMN, "flex items-center justify-end gap-2 py-3")}>
        {children}
      </div>
    </div>
  );
}
