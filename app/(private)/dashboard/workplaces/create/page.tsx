import DbPageWrapper from "@/components/dashboard/page-wrapper";
import WorkplaceForm from "@/components/dashboard/workplaces/workplace-form";
import React from "react";

const CreateWorkplacePage = () => {
  return (
    <DbPageWrapper title="Create Workplace">
      <WorkplaceForm />
    </DbPageWrapper>
  );
};

export default CreateWorkplacePage;
