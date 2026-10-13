import React from "react";

import { Label } from "@/components/shadcn/label";
import {
  SECTION_ICONS,
  SectionIconKey,
} from "@/components/icons/section-icons";
import { cn } from "@/lib/utils";

/**
 * The dashboard's section card: icon + title + description (+ an optional
 * control on the right), then a divider and the content. No content, no
 * divider.
 */
export function SectionCard({
  icon,
  title,
  description,
  hint,
  action,
  className,
  children,
}: {
  icon: SectionIconKey;
  title: string;
  description: string;
  /** A second, lighter line under the description. */
  hint?: string;
  /** Right of the header row: a button or a toggle. */
  action?: React.ReactNode;
  /** Applied to the content area under the divider. */
  className?: string;
  children?: React.ReactNode;
}) {
  const Icon = SECTION_ICONS[icon];
  return (
    <section className="rounded-lg border bg-background p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <h2 className="flex items-center gap-2 text-[15px] font-medium leading-tight text-foreground">
            <Icon className="size-4 shrink-0 text-primary" />
            {title}
          </h2>
          <p className="text-[13px] text-muted-foreground">{description}</p>
          {hint && (
            <p className="text-[13px] text-tertiary-foreground">{hint}</p>
          )}
        </div>
        {action}
      </div>
      {children && (
        <>
          <div role="separator" className="my-4 h-px bg-border" />
          <div className={cn("space-y-5", className)}>{children}</div>
        </>
      )}
    </section>
  );
}

/** A one-line field: label (and optional hint) left, short control right. */
export function ControlRow({
  id,
  label,
  hint,
  children,
}: {
  id?: string;
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0 space-y-1">
        <Label
          htmlFor={id}
          className="text-sm font-medium leading-tight text-foreground"
        >
          {label}
        </Label>
        {hint && <FieldHint>{hint}</FieldHint>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/** Helper text under (or beside) a field. */
export function FieldHint({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p className={cn("text-[13px] text-tertiary-foreground", className)}>
      {children}
    </p>
  );
}

/** A 1px rule between groups inside a card. */
export function CardDivider() {
  return <div role="separator" className="h-px bg-border" />;
}
