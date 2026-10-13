"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** The post preview (/dashboard/posts/<slug>) renders the public case study
 * page, so it keeps a padded wrapper; every other dashboard page draws its own
 * full-bleed page (gray background, card column, sticky bar). */
const isPreviewRoute = (pathname: string) =>
  /^\/dashboard\/posts\/[^/]+$/.test(pathname) &&
  pathname !== "/dashboard/posts/create";

export default function DashboardMain({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex flex-1 flex-col",
        isPreviewRoute(pathname)
          ? "gap-4 p-4 pt-0"
          : "min-h-[calc(100svh-4rem)]"
      )}
    >
      {children}
    </div>
  );
}
