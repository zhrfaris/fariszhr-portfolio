import { auth } from "@/auth";
import { Separator } from "@/components/shadcn/separator";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import HeaderBreadcrumb from "@/components/dashboard/header-breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/shadcn/sidebar";
import { getPosts } from "@/actions/post/get";
import DashboardMain from "@/components/dashboard/dashboard-main";
import { HEADER_ACTIONS_SLOT_ID } from "@/components/dashboard/header-actions-portal";
import { redirect } from "next/navigation";
import React from "react";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  // Server-side gate for every /dashboard page. Previously this rendered the
  // page content to anonymous visitors (just without the sidebar chrome).
  if (!session) redirect("/login");

  // Posts drive the sidebar's recent list (Live/Draft badge), newest first.
  // Posts carry no updated timestamp, so "newest" is creation time, which a
  // MongoDB ObjectId starts with (hex, so it sorts as a string). Keep it
  // slim — the sidebar only needs slug/title/status.
  const posts = session.user?.id ? await getPosts(session.user.id) : [];
  const sidebarPosts = [...posts]
    .sort((a, b) => b.id.localeCompare(a.id))
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      status: post.status,
    }));

  return (
    // `.dashboard-theme` switches on the dashboard tokens (app/globals.css).
    <SidebarProvider className="dashboard-theme">
      <AppSidebar session={session} posts={sidebarPosts} />
      {/* min-w-0: lets the breadcrumb truncate instead of widening the page */}
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex w-full items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <HeaderBreadcrumb posts={sidebarPosts} />
            {/* Per-page header actions (e.g. the Thumbnail|Content segmented
                control) are portaled into this slot by the active page. */}
            <div
              id={HEADER_ACTIONS_SLOT_ID}
              className="ml-auto flex items-center gap-2"
            />
          </div>
        </header>
        <DashboardMain>{children}</DashboardMain>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
