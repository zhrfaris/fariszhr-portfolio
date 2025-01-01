"use client";

import * as React from "react";
import {
  Blocks,
  BriefcaseBusiness,
  Globe,
  House,
  Newspaper,
  User,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/shadcn/sidebar";
import Link from "next/link";
import { Session } from "next-auth";

const data = {
  navMain: [
    {
      title: "Posts",
      url: "/dashboard/posts",
      icon: Newspaper,
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
};

export function AppSidebar({
  session,
  ...props
}: React.ComponentProps<typeof Sidebar> & { session: Session | null }) {
  const user = {
    name: session?.user?.name || "Guest",
    email: session?.user?.email || "",
    avatar: session?.user?.image || "",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/dashboard">
              <SidebarMenuButton>
                <h4 className="font-bold group-data-[collapsible=icon]:hidden">
                  Dashboard
                </h4>
                <House className="group-data-[state=expanded]:hidden" />
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain groupTitle="Profile" items={data.profile} />
        <NavMain groupTitle="Posts" items={data.navMain} />
      </SidebarContent>
      {session && (
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/">
                <SidebarMenuButton>
                  {/* group-data-[state=expanded]:hidden */}
                  <Globe className="" />
                  <h4 className="group-data-[collapsible=icon]:hidden">
                    Back To Web
                  </h4>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
          <NavUser user={user} />
        </SidebarFooter>
      )}
      <SidebarRail />
    </Sidebar>
  );
}
