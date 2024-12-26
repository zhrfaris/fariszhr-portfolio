import { getPosts } from "@/actions/post/get";
import { auth } from "@/auth";
import DbPageWrapper from "@/components/dashboard/page-wrapper";
import { PostTable } from "@/components/dashboard/posts/post-table";
import { redirect } from "next/navigation";
import React from "react";

const ManagePostPage = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const posts = await getPosts(session?.user.id, { selectAllRelations: true });

  return (
    <DbPageWrapper title="Posts" createButtonUrl="/dashboard/posts/create">
      <PostTable data={posts} />
    </DbPageWrapper>
  );
};

export default ManagePostPage;
