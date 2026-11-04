import { getPostBySlug } from "@/actions/post/get";
import { decrypt } from "@/app/(private)/api/utils";
import { auth } from "@/auth";
import PostEditor from "@/components/dashboard/posts/post-editor";
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
  const plainTextPasscode = post?.passwordHashed
    ? decrypt(post?.passwordHashed)
    : "";

  return <PostEditor initialData={post} initialPasscode={plainTextPasscode} />;
};

export default editPostPage;
