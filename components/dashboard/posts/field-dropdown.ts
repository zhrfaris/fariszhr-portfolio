/**
 * One look for the post form's dropdown fields (Category, Company), so they
 * can't drift apart: a 36px bordered field with a chevron, and an open panel
 * attached under it (the field's bottom corners square off, the panel shares
 * its border line), reading as one piece. No focus styling: the caret is the
 * only active indicator.
 */
export const fieldDropdown = {
  /** The closed / open field. Add `open` while the panel shows. */
  trigger:
    "relative flex min-h-9 w-full items-center gap-3 rounded-md border border-input bg-background text-left text-base outline-none md:text-[15px]",
  open: "rounded-b-none",
  /** Text entry inside the field (search / type to create). */
  input:
    "min-w-[4rem] flex-1 bg-transparent text-base outline-none placeholder:text-tertiary-foreground md:text-[15px]",
  placeholder: "text-tertiary-foreground",
  chevron: "pointer-events-none size-4 shrink-0 text-foreground",
  /** The panel: trigger width, shares the trigger's bottom border line. */
  panel:
    "absolute inset-x-0 top-full z-30 -mt-px overflow-hidden rounded-b-md border border-input bg-popover shadow-float",
  /** A list row in the panel. */
  item: "flex h-9 w-full items-center justify-between gap-3 px-3 text-left text-[15px] hover:bg-secondary",
  /** Small helper text in the panel. */
  hint: "text-[13px] text-muted-foreground",
} as const;
