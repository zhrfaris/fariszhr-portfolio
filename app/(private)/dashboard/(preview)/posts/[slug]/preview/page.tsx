import { getPortfolioBySlug } from "@/actions/post/get";
import { auth } from "@/auth";
import PostPreview from "@/components/dashboard/posts/post-preview";
import Header from "@/components/layouts/header";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import React from "react";

/*
 * Case study preview. Lives in the (preview) route group so it skips the
 * dashboard shell (sidebar, dashboard theme) and renders with the public
 * site's chrome and the public page's own <PortfolioDetail> template.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Preview",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

const PostPreviewPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ frame?: string }>;
}) => {
  // Same gate as the dashboard layout.
  const session = await auth();
  if (!session) redirect("/login");

  const { slug } = await params;
  const { frame } = await searchParams;

  // The last saved version (draft or live) — shown when the editor hasn't
  // handed over any unsaved state.
  const post = await getPortfolioBySlug(slug);
  if (!post) notFound();

  return (
    <PostPreview
      savedPost={post}
      // Inside the Mobile iframe: just the page, no toolbar.
      isFrame={frame === "1"}
      header={<Header />}
    />
  );
};

export default PostPreviewPage;
