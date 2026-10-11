"use client";

import * as React from "react";
import {
  Blocks,
  BriefcaseBusiness,
  Camera,
  Globe,
  PanelsTopLeft,
  User,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { NavPosts, SidebarPost } from "./nav-posts";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/shadcn/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Session } from "next-auth";

const data = {
  profile: [
    {
      title: "Profile",
      url: "#",
      icon: User,
      isActive: true,
      items: [
        {
          title: "Manage Profile",
          url: "/dashboard/profile/edit-profile",
        },
        {
          title: "Change Password",
          url: "/dashboard/profile/change-password",
        },
      ],
    },
  ],
  footer: [
    {
      title: "Landing Page",
      url: "/dashboard/landing",
      icon: PanelsTopLeft,
    },
    {
      title: "Photo Works",
      url: "/dashboard/gallery",
      icon: Camera,
    },
    {
      title: "Workplaces",
      url: "/dashboard/workplaces",
      icon: BriefcaseBusiness,
    },
    {
      title: "Categories",
      url: "/dashboard/categories",
      icon: Blocks,
    },
  ],
};

export function AppSidebar({
  session,
  posts,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  session: Session | null;
  posts: SidebarPost[];
}) {
  const pathname = usePathname();

  const user = {
    name: session?.user?.name || "Guest",
    email: session?.user?.email || "",
    avatar: session?.user?.image || "",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>{session && <NavUser user={user} />}</SidebarHeader>
      <SidebarContent>
        <NavMain items={data.profile} />
        <NavPosts posts={posts} />
      </SidebarContent>
      {session && (
        <SidebarFooter>
          <SidebarSeparator />
          <SidebarMenu>
            {data.footer.map((item) => (
              <SidebarMenuItem key={item.title}>
                <Link href={item.url}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={pathname.startsWith(item.url)}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <Link href="/">
                <SidebarMenuButton tooltip="Back To Web">
                  <Globe />
                  <span>Back To Web</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}
      <SidebarRail />
    </Sidebar>
  );
}
