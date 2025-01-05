import { getPortfolioBySlug } from "@/actions/post/get";
import { auth } from "@/auth";
import PortfolioDetail from "@/components/portfolio-detail/portfolio-detail";
import { redirect } from "next/navigation";
import React from "react";

const PostDetailPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const post = await getPortfolioBySlug(slug);

  if (!post) {
    redirect("/dashboard/posts");
  }

  return (
    <PortfolioDetail
      post={post}
      showEditButton={!!session?.user?.id}
      slug={slug}
    />
  );
};

export default PostDetailPage;
