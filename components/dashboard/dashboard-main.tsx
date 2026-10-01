"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** The post editor (create / edit) is full-bleed — it draws its own gray
 * preview band and sticky bottom bar edge-to-edge — so it opts out of the
 * padded content wrapper every other dashboard page uses. */
const isEditorRoute = (pathname: string) =>
  pathname === "/dashboard/posts/create" ||
  /^\/dashboard\/posts\/[^/]+\/edit$/.test(pathname);

export default function DashboardMain({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const editor = isEditorRoute(pathname);

  return (
    <div
      className={cn(
        "flex flex-1 flex-col",
        editor ? "min-h-[calc(100svh-4rem)]" : "gap-4 p-4 pt-0"
      )}
    >
      {children}
    </div>
  );
}
