"use client";

import { ChevronRight, Newspaper, Plus } from "lucide-react";
import { Status } from "@prisma/client";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/shadcn/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/shadcn/sidebar";
import { cn } from "@/lib/utils";

export interface SidebarPost {
  slug: string;
  title: string;
  status: Status;
}

/**
 * Posts collapsible in the dashboard sidebar. Lists "New post" followed by
 * every post (in the stored order) with a Live/Draft badge. The row matching
 * the current route is highlighted dark, matching the editor design.
 */
export function NavPosts({ posts }: { posts: SidebarPost[] }) {
  const pathname = usePathname();

  const isNewActive = pathname === "/dashboard/posts/create";

  return (
    <SidebarGroup>
      <SidebarMenu>
        <Collapsible defaultOpen asChild className="group/collapsible">
          <SidebarMenuItem>
            <Link href="/dashboard/posts">
              <SidebarMenuButton tooltip="Posts">
                <Newspaper />
                <span>Posts</span>
                <CollapsibleTrigger
                  asChild
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarMenuButton>
            </Link>
            <CollapsibleContent>
              <SidebarMenu className="mt-1 gap-0.5 group-data-[collapsible=icon]:hidden">
                {/* New post */}
                <SidebarMenuItem>
                  <PostRow
                    href="/dashboard/posts/create"
                    title="New post"
                    active={isNewActive}
                    leading={<Plus className="size-4 shrink-0" />}
                  />
                </SidebarMenuItem>

                {posts.map((post) => (
                  <SidebarMenuItem key={post.slug}>
                    <PostRow
                      href={`/dashboard/posts/${post.slug}/edit`}
                      title={post.title}
                      active={pathname === `/dashboard/posts/${post.slug}/edit`}
                      badge={post.status === Status.ACTIVE ? "Live" : "Draft"}
                    />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  );
}

function PostRow({
  href,
  title,
  active,
  badge,
  leading,
}: {
  href: string;
  title: string;
  active: boolean;
  badge?: "Live" | "Draft";
  leading?: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <SidebarMenuButton
        isActive={active}
        className="h-9 justify-between gap-2"
      >
        <span className="flex min-w-0 items-center gap-2">
          {leading}
          <span className="truncate">{title}</span>
        </span>
        {badge && (
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
              badge === "Live"
                ? "bg-success/15 text-success-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {badge}
          </span>
        )}
      </SidebarMenuButton>
    </Link>
  );
}
