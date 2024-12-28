import { getPostBySlug } from "@/actions/post/get";
import { auth } from "@/auth";
import DbPageWrapper from "@/components/dashboard/page-wrapper";
import PostForm from "@/components/dashboard/posts/post-form";
import { redirect } from "next/navigation";
import React from "react";

const editPostPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const post = await getPostBySlug(slug);

  return (
    <DbPageWrapper title="Edit Post">
      <PostForm initialData={post} />
    </DbPageWrapper>
  );
};

export default editPostPage;
