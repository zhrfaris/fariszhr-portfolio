import { getPosts } from "@/actions/post/get";
import { auth } from "@/auth";
import DbPageWrapper from "@/components/dashboard/page-wrapper";
import { SectionCard } from "@/components/dashboard/section-card";
import { buttonVariants } from "@/components/shadcn/button";
import { Plus } from "lucide-react";
import Link from "next/link";
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
    <DbPageWrapper title="Case studies">
      <SectionCard
        icon="caseStudies"
        title="Case studies"
        description="Everything you've written, published or still in draft."
        action={
          <Link href="/dashboard/posts/create" className={buttonVariants()}>
            <Plus />
            New case study
          </Link>
        }
      >
        <PostTable data={posts} />
      </SectionCard>
    </DbPageWrapper>
  );
};

export default ManagePostPage;
