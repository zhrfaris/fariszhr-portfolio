"use client";

import * as React from "react";
import {
  Blocks,
  BriefcaseBusiness,
  Camera,
  Globe,
  LucideIcon,
  Newspaper,
  PanelsTopLeft,
} from "lucide-react";
import { Status } from "@prisma/client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/shadcn/sidebar";
import { cn } from "@/lib/utils";
import StatusBadge from "./status-badge";
import {
  LogOutIcon,
  PasswordIcon,
  ProfileIcon,
} from "@/components/icons/section-icons";

export interface SidebarPost {
  slug: string;
  title: string;
  status: Status;
}

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
};

const SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: "Pages",
    items: [
      { title: "Landing Page", url: "/dashboard/landing", icon: PanelsTopLeft },
      { title: "Photo Works", url: "/dashboard/gallery", icon: Camera },
    ],
  },
  {
    label: "Library",
    items: [
      {
        title: "Workplaces",
        url: "/dashboard/workplaces",
        icon: BriefcaseBusiness,
      },
      { title: "Categories", url: "/dashboard/categories", icon: Blocks },
    ],
  },
  {
    label: "Account",
    items: [
      {
        title: "Profile",
        url: "/dashboard/profile/edit-profile",
        icon: ProfileIcon,
      },
      {
        title: "Password",
        url: "/dashboard/profile/change-password",
        icon: PasswordIcon,
      },
    ],
  },
];

/** How many recent posts the sidebar lists under "All case studies". */
const RECENT_POSTS = 5;

/** Sidebar row: 36px, 15px label, 16px icon with an 8px gap. */
const ROW = "h-9 gap-2 px-2 text-[15px]";

export function AppSidebar({
  session,
  posts,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  session: Session | null;
  /** Newest first. */
  posts: SidebarPost[];
}) {
  const pathname = usePathname();

  const name = session?.user?.name || "Guest";
  const initials =
    name
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2) || "A";

  // The post open in the editor (or its detail page), if any.
  const openSlug = pathname.match(
    /^\/dashboard\/posts\/([^/]+)(?:\/edit)?$/
  )?.[1];
  const activeSlug = openSlug && openSlug !== "create" ? openSlug : null;

  // Latest five, plus the open post as a sixth row when it is older, so the
  // active row is always visible.
  const recent = posts.slice(0, RECENT_POSTS);
  const openPost =
    activeSlug && !recent.some((p) => p.slug === activeSlug)
      ? posts.find((p) => p.slug === activeSlug)
      : undefined;
  const visiblePosts = openPost ? [...recent, openPost] : recent;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="px-4 pb-0 pt-6 group-data-[collapsible=icon]:px-2">
        <div className="flex items-center gap-3">
          <Avatar className="size-8 shrink-0 rounded-full">
            <AvatarImage src={session?.user?.image || ""} alt={name} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="truncate text-[15px] font-semibold text-foreground group-data-[collapsible=icon]:hidden">
            {name}
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0 pb-6">
        {/* 32px below the header; 24px between the other sections */}
        <Section label="Case Studies" className="pt-8">
          <SidebarMenuItem>
            <Link href="/dashboard/posts">
              <SidebarMenuButton
                tooltip="All case studies"
                isActive={pathname === "/dashboard/posts"}
                className={ROW}
              >
                <Newspaper />
                <span>All case studies</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>

          {visiblePosts.map((post) => (
            <SidebarMenuItem
              key={post.slug}
              className="group-data-[collapsible=icon]:hidden"
            >
              <Link href={`/dashboard/posts/${post.slug}/edit`}>
                <SidebarMenuButton
                  isActive={post.slug === activeSlug}
                  className="h-10 justify-between gap-2 pl-8 pr-2 text-[15px]"
                >
                  <span className="truncate">{post.title}</span>
                  <StatusBadge live={post.status === Status.ACTIVE} />
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </Section>

        {SECTIONS.map((section) => (
          <Section key={section.label} label={section.label}>
            {section.items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <Link href={item.url}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={pathname.startsWith(item.url)}
                    className={ROW}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </Section>
        ))}
      </SidebarContent>

      {/* Pinned; the content above scrolls when the window is short */}
      <SidebarFooter className="px-2 pb-4 pt-2">
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <Link href="/">
              <SidebarMenuButton tooltip="View site" className={ROW}>
                <Globe />
                <span>View site</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Log out"
              className={ROW}
              onClick={() => {
                toast.loading("Logging out...");
                signOut({ callbackUrl: "/" });
              }}
            >
              <LogOutIcon />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function Section({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <SidebarGroup className={cn("px-2 pb-0 pt-6", className)}>
      <SidebarGroupLabel className="h-6 px-1">{label}</SidebarGroupLabel>
      <SidebarMenu className="gap-1">{children}</SidebarMenu>
    </SidebarGroup>
  );
}
