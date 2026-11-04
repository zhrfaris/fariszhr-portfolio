import { getWorkplaces } from "@/actions/workplace/get";
import { auth } from "@/auth";
import DbPageWrapper from "@/components/dashboard/page-wrapper";
import { SectionCard } from "@/components/dashboard/section-card";
import { buttonVariants } from "@/components/shadcn/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { WorkplaceTable } from "@/components/dashboard/workplaces/workplace-table";
import { redirect } from "next/navigation";
import React from "react";

const ManageWorkplacesPage = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const workplaces = await getWorkplaces(session?.user.id);

  return (
    <DbPageWrapper title="Workplaces">
      <SectionCard
        icon="workplaces"
        title="Workplaces"
        description="Companies you've worked with. Pick one when tagging a case study."
        action={
          <Link
            href="/dashboard/workplaces/create"
            className={buttonVariants()}
          >
            <Plus />
            New workplace
          </Link>
        }
      >
        <WorkplaceTable data={workplaces} />
      </SectionCard>
    </DbPageWrapper>
  );
};

export default ManageWorkplacesPage;
