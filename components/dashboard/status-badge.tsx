import { cn } from "@/lib/utils";

/** Live / Draft pill: 13px, 4px radius; green tint for Live, gray fill for Draft. */
export default function StatusBadge({
  live,
  children,
  className,
}: {
  live: boolean;
  /** Defaults to "Live" / "Draft". */
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center rounded-sm px-1.5 text-[13px] font-normal leading-none",
        live
          ? "bg-success-tint text-success-foreground"
          : "bg-secondary text-foreground",
        className
      )}
    >
      {children ?? (live ? "Live" : "Draft")}
    </span>
  );
}
