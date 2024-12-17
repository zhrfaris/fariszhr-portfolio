import { getWorkplaces } from "@/actions/workplace/get";
import { auth } from "@/auth";
import DbPageWrapper from "@/components/dashboard/page-wrapper";
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
    <DbPageWrapper
      title="Workplaces"
      createButtonUrl="/dashboard/workplaces/create"
    >
      <WorkplaceTable data={workplaces} />
    </DbPageWrapper>
  );
};

export default ManageWorkplacesPage;
