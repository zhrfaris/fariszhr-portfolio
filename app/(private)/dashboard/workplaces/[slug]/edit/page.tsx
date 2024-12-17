import { getWorkplaceBySlug } from "@/actions/workplace/get";
import DbPageWrapper from "@/components/dashboard/page-wrapper";
import WorkplaceForm from "@/components/dashboard/workplaces/workplace-form";
import React from "react";

const EditWorkplacePage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const workplace = await getWorkplaceBySlug(slug);

  return (
    <DbPageWrapper title="Edit Workplace">
      <WorkplaceForm workplace={workplace} />
    </DbPageWrapper>
  );
};

export default EditWorkplacePage;
